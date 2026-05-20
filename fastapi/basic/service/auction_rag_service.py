import asyncio
import base64
import os
from pathlib import Path
from typing import Optional

import numpy as np
from fastapi import HTTPException

from domain.AuctionRag import (
    AuctionRagAnalyzeRequest,
    AuctionRagAnalyzeResponse,
    AuctionRagIndexResponse,
)

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    load_dotenv = None


BASE_DIR = Path(__file__).resolve().parents[1]
LLM_WORKSPACE = Path(os.getenv("LLM_WORKSPACE", str(BASE_DIR / "llm_workspace")))
DEFAULT_REPORT_PATH = LLM_WORKSPACE / "documents" / "Tinuiti_Q1_2026_Digital_Ads_Benchmark_Report.pdf"
DEFAULT_WORKING_DIR = LLM_WORKSPACE / "trend_pulse_storage"
DEFAULT_OUTPUT_DIR = LLM_WORKSPACE / "rag_output"


class AuctionRagService:
    def __init__(self):
        self._rag = None
        self._init_lock = asyncio.Lock()
        self._api_key = None

    def _get_api_key(self) -> str:
        if load_dotenv:
            load_dotenv()
            load_dotenv(LLM_WORKSPACE / ".env", override=False)

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY가 .env에 없습니다.")
        self._api_key = api_key
        return api_key

    def _get_optional_api_key(self) -> Optional[str]:
        if self._api_key:
            return self._api_key
        if load_dotenv:
            load_dotenv()
            load_dotenv(LLM_WORKSPACE / ".env", override=False)
        self._api_key = os.getenv("OPENAI_API_KEY")
        return self._api_key

    async def get_rag(self):
        if self._rag is not None:
            return self._rag

        async with self._init_lock:
            if self._rag is None:
                self._rag = await self._setup_rag_system()
        return self._rag

    async def _setup_rag_system(self):
        os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

        api_key = self._get_api_key()

        try:
            from raganything import RAGAnything, RAGAnythingConfig
            from lightrag.llm.openai import openai_complete_if_cache
            from lightrag.utils import EmbeddingFunc
            from langchain_huggingface import HuggingFaceEmbeddings
        except ModuleNotFoundError as e:
            raise HTTPException(
                status_code=500,
                detail=f"RAG-Anything 의존성이 설치되어 있지 않습니다: {e.name}",
            ) from e

        config = RAGAnythingConfig(
            working_dir=str(DEFAULT_WORKING_DIR),
            parser="docling",
            parse_method="auto",
            enable_image_processing=True,
            enable_table_processing=True,
        )

        def llm_model_func(prompt, system_prompt=None, history_messages=None, **kwargs):
            return openai_complete_if_cache(
                "gpt-4o-mini",
                prompt,
                system_prompt=system_prompt,
                history_messages=history_messages or [],
                api_key=api_key,
                **kwargs,
            )

        def vision_model_func(prompt, image_data=None, **kwargs):
            if image_data:
                vision_prompt = [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
                    },
                ]
            else:
                vision_prompt = prompt

            return openai_complete_if_cache(
                "gpt-4o-mini",
                vision_prompt,
                api_key=api_key,
                **kwargs,
            )

        hf_embeddings = HuggingFaceEmbeddings(model_name="jhgan/ko-sbert-nli")

        async def embedding_wrapper(texts):
            return np.array(hf_embeddings.embed_documents(texts))

        embedding_func = EmbeddingFunc(
            embedding_dim=768,
            max_token_size=512,
            func=embedding_wrapper,
        )

        return RAGAnything(
            config=config,
            llm_model_func=llm_model_func,
            vision_model_func=vision_model_func,
            embedding_func=embedding_func,
        )

    async def index_report(self, file_path: Optional[str], output_dir: str) -> AuctionRagIndexResponse:
        resolved_file = Path(file_path) if file_path else DEFAULT_REPORT_PATH
        if not resolved_file.exists():
            raise HTTPException(status_code=404, detail=f"문서를 찾을 수 없습니다: {resolved_file}")

        rag = await self.get_rag()
        resolved_output_dir = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR
        if not resolved_output_dir.is_absolute():
            resolved_output_dir = LLM_WORKSPACE / resolved_output_dir

        await rag.process_document_complete(
            file_path=str(resolved_file),
            output_dir=str(resolved_output_dir),
        )

        return AuctionRagIndexResponse(
            indexed=True,
            file_path=str(resolved_file),
            message="경매 RAG 지식베이스 인덱싱 완료",
        )

    async def analyze(self, request: AuctionRagAnalyzeRequest) -> AuctionRagAnalyzeResponse:
        if request.fast_mode:
            return await self._analyze_fast(request)

        rag = await self.get_rag()
        image_data = self._resolve_image_base64(request)

        image_analysis = await rag.vision_model_func(
            self._build_image_prompt(request),
            image_data=image_data,
        )

        rag_query = self._build_rag_query(request, image_analysis)
        try:
            auction_report = await rag.aquery(rag_query, mode="hybrid")
            used_rag = True
        except Exception as e:
            auction_report = await rag.llm_model_func(
                rag_query
                + "\n\nRAG 검색이 실패했습니다. 검색 실패 사유를 밝히고, 입력값과 이미지 분석만 기준으로 보수적으로 작성하세요."
                + f"\n실패 사유: {type(e).__name__}: {e}"
            )
            used_rag = False

        return AuctionRagAnalyzeResponse(
            image_analysis=str(image_analysis),
            auction_report=str(auction_report),
            used_rag=used_rag,
            indexed_document_hint=str(DEFAULT_REPORT_PATH),
        )

    async def _analyze_fast(self, request: AuctionRagAnalyzeRequest) -> AuctionRagAnalyzeResponse:
        image_analysis = self._build_fast_image_summary(request)
        prompt = self._build_fast_report_prompt(request, image_analysis)
        auction_report = await self._complete_fast_report(prompt, request, image_analysis)

        return AuctionRagAnalyzeResponse(
            image_analysis=image_analysis,
            auction_report=str(auction_report),
            used_rag=False,
            indexed_document_hint="fast_mode: RAG 전체 검색 생략",
        )

    async def _complete_fast_report(self, prompt: str, request: AuctionRagAnalyzeRequest, image_analysis: str) -> str:
        api_key = self._get_optional_api_key()
        if not api_key:
            return self._build_local_fast_report(request, image_analysis, "OPENAI_API_KEY 미설정")

        try:
            from lightrag.llm.openai import openai_complete_if_cache
            return await openai_complete_if_cache(
                os.getenv("OPENAI_AUCTION_MODEL", "gpt-4o-mini"),
                prompt,
                system_prompt="당신은 BIDEO 경매 플랫폼의 빠른 투자 분석 리포트를 작성하는 전문가입니다.",
                history_messages=[],
                api_key=api_key,
            )
        except ModuleNotFoundError:
            pass
        except Exception as e:
            return self._build_local_fast_report(request, image_analysis, f"OpenAI 분석 실패: {type(e).__name__}")

        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=api_key)
            response = await client.chat.completions.create(
                model=os.getenv("OPENAI_AUCTION_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": "당신은 BIDEO 경매 플랫폼의 빠른 투자 분석 리포트를 작성하는 전문가입니다."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
            )
            return response.choices[0].message.content or self._build_local_fast_report(request, image_analysis, "OpenAI 응답 없음")
        except Exception as e:
            return self._build_local_fast_report(request, image_analysis, f"OpenAI 분석 실패: {type(e).__name__}")

    def _build_local_fast_report(self, request: AuctionRagAnalyzeRequest, image_analysis: str, reason: str) -> str:
        start_price = max(request.start_price, 0)
        current_price = max(request.current_price, start_price)
        bid_count = max(request.bid_count, 0)
        bidder_count = max(request.bidder_count, 0)
        engagement = max(request.view_count, 0) * 0.02 + max(request.like_count, 0) * 0.8 + bid_count * 8 + bidder_count * 12
        price_growth = 0 if start_price <= 0 else (current_price - start_price) / start_price
        success = "낮음"
        if engagement >= 80 or price_growth >= 0.35 or bidder_count >= 5:
            success = "높음"
        elif engagement >= 35 or price_growth >= 0.12 or bidder_count >= 2:
            success = "보통"

        floor_price = max(current_price, start_price)
        base_price = int(max(floor_price, floor_price * (1 + min(price_growth + bid_count * 0.025, 0.45))))
        high_price = int(max(base_price, floor_price * (1 + min(price_growth + bid_count * 0.045 + bidder_count * 0.03, 0.85))))
        recommendation = "조건부 추천" if success == "보통" else ("추천" if success == "높음" else "비추천")

        return (
            f"{reason} 기준의 보수적 빠른 분석입니다.\n"
            f"1. 경매 성공 가능성: {success}\n"
            f"2. 현재 가격 매력도: 시작가 {start_price:,}원 대비 현재가 {current_price:,}원으로, 가격 상승률은 {round(price_growth * 100, 1)}%입니다.\n"
            f"3. 예상 입찰자 수 범위: {max(1, bidder_count)}~{max(2, bidder_count + 3)}명\n"
            f"4. 예상 최종 낙찰가 범위: {base_price:,}~{high_price:,}원\n"
            f"5. ROI Forecast: 보수 0~5%, 기준 5~12%, 낙관 12~20% 추정\n"
            f"6. 입찰 추천: {recommendation}\n"
            f"7. 개선안: 제목은 12자 이상, 설명은 활용처와 희소성을 포함하고 태그는 4개 이상으로 보강하세요.\n\n"
            f"[작품 분석]\n{image_analysis}"
        )

    def _build_fast_image_summary(self, request: AuctionRagAnalyzeRequest) -> str:
        content_score = 0
        if request.title and len(request.title.strip()) >= 6:
            content_score += 25
        if request.description and len(request.description.strip()) >= 30:
            content_score += 35
        if request.tags:
            content_score += min(len(request.tags) * 8, 24)
        if request.image_url or request.image_base64 or request.image_path:
            content_score += 16

        reaction_score = 0
        reaction_score += min(request.bid_count * 12, 36)
        reaction_score += min(request.bidder_count * 14, 28)
        reaction_score += min(request.view_count / 20, 20)
        reaction_score += min(request.like_count / 5, 16)

        price_gap = request.current_price - request.start_price
        price_signal = "현재가는 시작가와 유사해 초기 검증 단계입니다."
        if request.start_price > 0 and price_gap > 0:
            growth_rate = price_gap / request.start_price
            if growth_rate >= 0.5:
                price_signal = "현재가가 시작가 대비 크게 올라 가격 경쟁 신호가 있습니다."
            elif growth_rate >= 0.15:
                price_signal = "현재가가 시작가 대비 완만하게 올라 입찰 관심이 확인됩니다."

        level = "낮음"
        total_score = content_score + reaction_score
        if total_score >= 75:
            level = "높음"
        elif total_score >= 45:
            level = "보통"

        return (
            f"입력값 기준 빠른 분석입니다. 콘텐츠 완성도 점수는 {content_score}/100, "
            f"경매 반응 점수는 {round(reaction_score)}/100 수준이며 종합 매력도는 {level}입니다. "
            f"{price_signal} 이미지의 세부 색감/질감 평가는 빠른 모드에서 생략했습니다."
        )

    def _build_fast_report_prompt(self, request: AuctionRagAnalyzeRequest, image_analysis: str) -> str:
        return f"""
        아래 BIDEO 경매 작품을 빠르게 분석해줘.
        RAG 전체 검색과 이미지 비전 분석은 생략된 빠른 모드이므로, 확실하지 않은 마케팅 수치는 "추정"이라고 표시해.

        [빠른 작품 분석]
        {image_analysis}

        [경매 입력값]
        제목: {request.title or "미입력"}
        설명: {request.description or "미입력"}
        카테고리: {request.category or "미입력"}
        태그: {", ".join(request.tags) if request.tags else "미입력"}
        시작가: {request.start_price:,}원
        현재가: {request.current_price:,}원
        입찰 수: {request.bid_count}
        입찰자 수: {request.bidder_count}
        조회수: {request.view_count}
        좋아요: {request.like_count}

        [출력]
        1. 경매 성공 가능성: 낮음/보통/높음
        2. 현재 가격 매력도
        3. 예상 입찰자 수 범위
        4. 예상 최종 낙찰가 범위
        5. ROI Forecast: 보수/기준/낙관
        6. 입찰 추천: 비추천/조건부 추천/추천/강력 추천
        7. 제목/설명/태그 개선안

        한국어로 짧고 구체적으로 작성해.
        """

    def _resolve_image_base64(self, request: AuctionRagAnalyzeRequest) -> Optional[str]:
        if request.image_base64:
            if "," in request.image_base64 and request.image_base64.strip().startswith("data:"):
                return request.image_base64.split(",", 1)[1]
            return request.image_base64

        if request.image_path:
            image_path = Path(request.image_path)
            if not image_path.exists():
                raise HTTPException(status_code=404, detail=f"이미지를 찾을 수 없습니다: {image_path}")
            return base64.b64encode(image_path.read_bytes()).decode("utf-8")

        return None

    def _build_image_prompt(self, request: AuctionRagAnalyzeRequest) -> str:
        return f"""
        이 디자인 리소스를 BIDEO 경매 플랫폼에 등록된 예술적/상업적 작품으로 분석해줘.

        [경매 등록 정보]
        제목: {request.title or "미입력"}
        설명: {request.description or "미입력"}
        카테고리: {request.category or "미입력"}
        태그: {", ".join(request.tags) if request.tags else "미입력"}
        시작가: {request.start_price:,}원
        현재가: {request.current_price:,}원
        입찰 수: {request.bid_count}
        입찰자 수: {request.bidder_count}
        조회수: {request.view_count}
        좋아요: {request.like_count}
        이미지 URL: {request.image_url or "없음"}

        [분석 항목]
        1. 시각적 핵심 요소: 컬러 팔레트, 질감(3D/Flat), 모션감, 완성도
        2. 상업적 희소성: 현재 마케팅/콘텐츠 시장에서의 트렌디함과 차별성
        3. 소구 타겟: 강하게 반응할 가능성이 높은 구매자/브랜드/세대
        4. 브랜드 연상: 광고나 캠페인에 사용했을 때 각인될 이미지
        5. 경매 매력도: 시작가, 현재 반응, 입찰 가능성을 기준으로 평가
        6. 감점 요인: 제목/설명/태그/이미지 완성도가 부족하면 명확히 지적

        [출력 형식]
        - 경매 요약 보고서 스타일
        - 한국어
        - 짧은 문단 또는 항목형
        - 과장 금지
        - 확실하지 않은 내용은 "추정"이라고 표시
        """

    def _build_rag_query(self, request: AuctionRagAnalyzeRequest, image_analysis: str) -> str:
        return f"""
        당신은 마케팅 ROI 분석 전문가입니다.
        BIDEO 경매에 출품된 다음 작품에 대해 'Tinuiti Q1 2026 리포트' 데이터를 기반으로 투자 가치 분석서를 작성하세요.

        [출품작 분석 데이터]
        {image_analysis}

        [경매 입력값]
        제목: {request.title or "미입력"}
        설명: {request.description or "미입력"}
        카테고리: {request.category or "미입력"}
        태그: {", ".join(request.tags) if request.tags else "미입력"}
        시작가: {request.start_price:,}원
        현재가: {request.current_price:,}원
        입찰 수: {request.bid_count}
        입찰자 수: {request.bidder_count}
        조회수: {request.view_count}
        좋아요: {request.like_count}

        [리포트 작성 가이드라인]
        1. 시장 지표 결합:
           Tinuiti 리포트에서 언급된 2026년 플랫폼별(Meta, Google, TikTok, YouTube 등)
           CTR, CPC, CPM 변동 추이를 인용하여 이 작품이 어느 채널에서 가장 비용 효율적일지 분석하세요.

        2. 광고 포맷 매칭:
           리포트 내 성과가 좋은 광고 유형
           예: Advantage+ 쇼핑 캠페인, YouTube Shorts, TikTok, Performance Max 등과
           이 작품의 결합 가능성을 평가하세요.

        3. 경제적 가치 산정:
           이 작품을 광고 소재로 활용했을 때 예상되는 CVR, CTR, ROAS 개선 가능성을
           리포트 벤치마크와 비교해 설명하세요.
           단, 리포트에 직접 근거가 없는 수치는 "추정"이라고 표시하세요.

        4. 입찰 권장 사유:
           낙찰 시 얻을 수 있는 전략적 우위와 브랜드 활용 가능성을 설명하세요.

        5. 최종 ROI Forecast:
           2026년 상반기 마케팅 환경을 고려해 예상 ROI 범위를 제시하세요.
           단일 숫자보다 보수/기준/낙관 시나리오로 구분하세요.

        6. 경매 판단:
           현재 시작가와 반응 지표를 기준으로 입찰 추천 여부를
           "비추천 / 조건부 추천 / 추천 / 강력 추천" 중 하나로 제시하세요.

        [출력 형식]
        - 전문적이고 설득력 있는 비즈니스 톤
        - 한국어
        - BIDEO 경매 투자 분석 보고서 스타일
        - 근거 수치와 추정 수치를 구분
        - 과장 금지
        """
