from botocore.exceptions import ClientError
from fastapi import HTTPException
from langchain_openai import ChatOpenAI
from openai import OpenAI
from pathlib import Path
from datetime import datetime
import base64
import time
import uuid
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser, PydanticOutputParser
from langchain_core.runnables import RunnableLambda
from dotenv import load_dotenv
import requests
import boto3, os
from starlette.concurrency import run_in_threadpool

from domain.image import (
    ImageAnalyzeRequest,
    ImageAnalyzeResponse,
    ImageGenerateRequest,
    ImageGenerateResponse,
    ImagePipelineRequest,
    ImagePipelineResponse,
)
from domain.product import ProductCreate
from service.product_service import ProductService
from botocore.config import Config

import redis
from langchain_core.globals import set_llm_cache
from langchain_community.cache import RedisCache

import io

# 설정 파일에서 API 키 로드
load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[1]
IMAGE_DIR = BASE_DIR / "images"

# S3 클라이언트 설정
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name=os.getenv("AWS_REGION"),
    config=Config(
        signature_version='s3v4',
        s3={'addressing_style': 'virtual'}
    )
)

BUCKET_NAME = "hds-rec-bucket"
IMAGE_BUCKET_NAME = (
    os.getenv("AWS_IMAGE_BUCKET")
    or os.getenv("AWS_S3_BUCKET")
    or os.getenv("AWS_BUCKET_NAME")
    or "bideo-back"
)


# AI 기능 전용 서비스
# 회귀 예측 로직은 service/work_service.py로 분리했다.
class AiService:
    def __init__(self):
        redis_client = self._create_redis_client()
        if redis_client:
            try:
                set_llm_cache(RedisCache(redis_client))
            except Exception:
                redis_client = None

        self.model = ChatOpenAI(
            temperature=0.1,
            model_name=os.getenv("OPENAI_TEXT_MODEL", "gpt-4o-mini"),
        )
        self.model_of_STT = OpenAI()
        self.redis = redis_client

    def _create_redis_client(self):
        redis_url = os.getenv("REDIS_URL")
        host = os.getenv("REDIS_HOST") or os.getenv("EC2_HOST") or "localhost"
        port = int(os.getenv("REDIS_PORT", "6379"))
        try:
            client = redis.Redis.from_url(redis_url) if redis_url else redis.Redis(host=host, port=port, db=0)
            client.ping()
            return client
        except Exception:
            return None

    # Bideo-pipeline.ipynb의 이미지 생성 코드를 기존 AI 서비스 구조 안에서 실행한다.
    async def generate_image(self, request: ImageGenerateRequest) -> ImageGenerateResponse:
        return await run_in_threadpool(self._generate_image, request)

    def _generate_image(self, request: ImageGenerateRequest) -> ImageGenerateResponse:
        image_path = self._generate_image_file(
            prompt=request.prompt,
            size=request.size
        )
        uploaded_image = self._upload_image_to_s3(image_path)
        return ImageGenerateResponse(
            image_path=str(image_path),
            image_key=uploaded_image["key"],
            image_url=uploaded_image["url"],
            file_type=uploaded_image["content_type"],
            file_size=uploaded_image["size"]
        )

    # 기존 이미지 파일 또는 URL을 분석해서 게시글 제목/내용을 생성한다.
    async def analyze_image(self, request: ImageAnalyzeRequest) -> ImageAnalyzeResponse:
        return await run_in_threadpool(self._analyze_image_response, request)

    def _analyze_image_response(self, request: ImageAnalyzeRequest) -> ImageAnalyzeResponse:
        description, cache_hit = self._analyze_image_with_cache(request.image_path)
        return ImageAnalyzeResponse(description=description, cache_hit=cache_hit)

    # prompt -> 이미지 생성 -> 생성 이미지 제목/내용 생성
    async def run_image_pipeline(self, request: ImagePipelineRequest) -> ImagePipelineResponse:
        return await run_in_threadpool(self._run_image_pipeline, request)

    def _run_image_pipeline(self, request: ImagePipelineRequest) -> ImagePipelineResponse:
        image_path = self._generate_image_file(
            prompt=request.prompt,
            size=request.size
        )
        description, cache_hit = self._analyze_image_with_cache(str(image_path))
        uploaded_image = self._upload_image_to_s3(image_path)

        return ImagePipelineResponse(
            image_path=str(image_path),
            description=description,
            regenerated_image_path=str(image_path),
            cache_hit=cache_hit,
            image_key=uploaded_image["key"],
            image_url=uploaded_image["url"],
            file_type=uploaded_image["content_type"],
            file_size=uploaded_image["size"]
        )

    def _generate_image_file(self, prompt: str, size: str) -> Path:
        response = self.model_of_STT.images.generate(
            model=os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1"),
            prompt=prompt,
            size=size,
            n=1
        )

        image_base64 = response.data[0].b64_json
        if not image_base64:
            raise HTTPException(status_code=500, detail="이미지 생성 결과가 비어 있습니다.")

        image_bytes = base64.b64decode(image_base64)
        IMAGE_DIR.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"image_{timestamp}.png"
        image_path = IMAGE_DIR / filename
        image_path.write_bytes(image_bytes)

        return image_path

    def _upload_image_to_s3(self, image_path: Path) -> dict:
        content_type = "image/png"
        image_bytes = image_path.read_bytes()
        key = f"works/{datetime.now().strftime('%Y/%m/%d')}/{uuid.uuid4().hex}_{image_path.name}"

        try:
            s3_client.put_object(
                Bucket=IMAGE_BUCKET_NAME,
                Key=key,
                Body=image_bytes,
                ContentType=content_type
            )
            image_url = s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": IMAGE_BUCKET_NAME,
                    "Key": key
                },
                ExpiresIn=3600
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 이미지 업로드 실패: {e}") from e

        return {
            "key": key,
            "url": image_url,
            "content_type": content_type,
            "size": len(image_bytes)
        }

    def _analyze_image_with_cache(self, image_path: str) -> tuple[str, bool]:
        cache_key = f"llm_cache:bideo_pipeline_description:{image_path}"
        if self.redis:
            try:
                cached_response = self.redis.get(cache_key)
                if cached_response:
                    if isinstance(cached_response, bytes):
                        cached_response = cached_response.decode("utf-8")
                    return cached_response, True
            except Exception:
                pass

        description = self._analyze_image(image_path)
        if description and self.redis:
            try:
                self.redis.setex(cache_key, 3600, description)
            except Exception:
                pass

        return description, False

    def _analyze_image(self, image_path: str) -> str:
        image_url = self._get_image_url(image_path)

        system_prompt = """
                        당신은 이미지를 분석하는 제작 AI입니다.
                        답변 이후 사용자에게 추가적인 질문은 하지 않습니다.
                        """
        human_prompt = """
                        이미지를 보고 게시글 제목과 내용을 생성해라.

                        형식:
                        제목: 한 줄 \n
                        내용:
                        1. 첫 번째 설명
                        2. 두 번째 설명
                        3. 세 번째 설명

                        조건:
                        - 인사말 금지
                        - 부연 설명 금지
                        - 경매/영상 플랫폼 게시글처럼 작성
                        """

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=[
                {"type": "text", "text": human_prompt},
                {"type": "image_url", "image_url": {"url": image_url}}
            ])
        ]

        description = ""
        for chunk in self.model.stream(messages):
            content = chunk.content
            if content:
                description += content
                time.sleep(0.001)

        return description

    def _get_image_url(self, image_path: str) -> str:
        if image_path.startswith(("http://", "https://", "data:image/")):
            return image_path

        path = Path(image_path)
        if not path.is_absolute():
            path = BASE_DIR / image_path

        if not path.exists():
            raise HTTPException(status_code=404, detail=f"이미지 파일을 찾을 수 없습니다: {image_path}")

        image_base64 = base64.b64encode(path.read_bytes()).decode("utf-8")
        ext = path.suffix.lower().replace(".", "")
        mime_ext = ext if ext in {"png", "jpeg", "jpg", "webp"} else "png"
        if mime_ext == "jpg":
            mime_ext = "jpeg"

        return f"data:image/{mime_ext};base64,{image_base64}"

    async def get_flight_time(self, country: str) -> str:
        template = """
        한국(인천 공항)에서 {country}까지 비행기를 이용할 때 소요되는 평균 시간을 알려줘.

        1. 직항이 있다면 직항 기준 소요 시간.
        2. 직항이 없다면 가장 효율적인 경유 노선과 대기 시간을 포함한 최소 소요 시간.
        3. 답변은 
         - 직항일 경우: 'OO시간 00분'
         - 직항이 없을 경우: 'OO시간 00분, 경유 : O회, 경유지: 국가명1, 국가명2,...' 
        형식으로만 작성해줘."""

        # from_template 메소드를 이용하여 PromptTemplate 객체 생성
        prompt = PromptTemplate.from_template(template)
        chain = prompt | self.model | StrOutputParser()
        return await chain.ainvoke(country)

    async def create_product_with_ai(self) -> int:
        product_service = ProductService()
        template = """
            상품명(str)과 가격(int)을 1개씩 생성해줘. 
            반드시 JSON 형식으로만 답변하고, 앞뒤에 인사말이나 부연 설명을 절대 붙이지 마.
            {format_instructions}
        """
        parser = PydanticOutputParser(pydantic_object=ProductCreate)
        prompt = PromptTemplate(template=template, partial_variables={"format_instructions": parser.get_format_instructions()})

        chain = prompt | self.model | parser | RunnableLambda(product_service.create_product)
        await chain.ainvoke({})

    async def summarize(self) -> str:
        try:
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': BUCKET_NAME,
                    'Key': "rec_test.mp3"
                },
                ExpiresIn=3600  # URL 유효 기간 (초 단위, 여기서는 1시간)
            )
        #     print(url)
        #     await self.debug_download(url)

            # url을 STT에 전달
            audio_bytes = requests.get(url).content

            transcript = self.model_of_STT.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=("audio.mp3", audio_bytes)
            )
            content = transcript.text

            template = """
                    # Role
                    너는 10년 차 베테랑 국제 무역 실무자이자 회의록 작성 전문가야. 
                    복잡한 수입/수출 회의 내용을 분석하여 실무자가 바로 참조할 수 있는 '무역 회의 결과 보고서'를 작성해줘.
                    
                    # Task
                    제공된 회의 녹취록(또는 메모)을 바탕으로 아래 [Format]에 맞춰 내용을 요약해. 
                    단, 무역 전문 용어(Incoterms, LC, 선적 조건 등)는 맥락에 맞게 정확히 사용해야 해.
                    
                    # Format
                    1. 회의 개요
                       - 일시 및 참여 업체:
                       - 주요 안건: (예: 신규 라인 단가 협상, 선적 지연 해결 등)
                    
                    2. 품목 및 가격 조건 (가장 중요)
                       - 대상 품목:
                       - 합의 단가 및 수량:
                       - 통화(Currency):
                    
                    3. 물류 및 인도 조건
                       - 인도 조건 (Incoterms 2020 기준): (예: FOB, CIF, DDP 등)
                       - 선적 예정일 (ETD/ETA):
                       - 선적 항구 및 도착 항구:
                    
                    4. 결제 및 행정 사항
                       - 결제 방식: (예: T/T 30/70, L/C, CAD 등)
                       - 주요 서류 요구사항:
                    
                    5. 주요 합의 사항 (Key Decisions)
                       - 양측이 최종 동의한 핵심 내용들
                    
                    6. 향후 과제 및 미결 사항 (Action Items)
                       - [업체A]가 할 일: (기한 포함)
                       - [업체B]가 할 일: (기한 포함)
                       - 차기 회의 시 논의할 미결제 안건:
                    
                    # Tone & Style
                    - 전문적이고 간결한 비즈니스 문체 사용.
                    - 수치와 날짜는 반드시 정확하게 추출할 것.
                    - 모호한 내용은 '확인 필요'로 표시할 것.
                    
                    # Input Data
                    {content}
                    """
            prompt = PromptTemplate(input_variables=["content"], template=template)
            chain = prompt | self.model | StrOutputParser()

            return await chain.ainvoke({'content': content})

        except ClientError as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def debug_download(self, url):
        response = requests.get(url)
        if response.status_code != 200:
            print(f"에러 코드: {response.status_code}")
            print(f"S3 상세 메시지: {response.text}")
        else:
            print("성공!")

    def upload_to_s3(image_bytes, filename):
        try:
            image_file = io.BytesIO(image_bytes)

            # S3 업로드
            s3_client.upload_fileobj(
                image_file,
                BUCKET_NAME,
                filename,
                ExtraArgs={'ContentType': 'image/png'}
            )
        except Exception as e:
            print(f"S3 업로드 실패: {e}")
