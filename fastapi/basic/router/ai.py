from fastapi import APIRouter, status
from domain.image import (
    ImageAnalyzeRequest,
    ImageAnalyzeResponse,
    ImageGenerateRequest,
    ImageGenerateResponse,
    ImagePipelineRequest,
    ImagePipelineResponse,
)
from service.ai_service import AiService


# AI 기능 전용 라우터
router = APIRouter(prefix="/api/ai", tags=["Products"])


ai_service = AiService()

@router.get("/flight-time", response_model=str, status_code=status.HTTP_200_OK)
async def get_flight_time(country: str):
    return await ai_service.get_flight_time(country)

@router.post("/product", status_code=status.HTTP_201_CREATED)
async def create_product():
    await ai_service.create_product_with_ai()

@router.get("/summary")
async def get_summary():
    return await ai_service.summarize()


@router.post("/image/generate", response_model=ImageGenerateResponse, status_code=status.HTTP_201_CREATED)
async def generate_image(request: ImageGenerateRequest):
    return await ai_service.generate_image(request)


@router.post("/image/analyze", response_model=ImageAnalyzeResponse, status_code=status.HTTP_200_OK)
async def analyze_image(request: ImageAnalyzeRequest):
    return await ai_service.analyze_image(request)


@router.post("/image/pipeline", response_model=ImagePipelineResponse, status_code=status.HTTP_201_CREATED)
async def run_image_pipeline(request: ImagePipelineRequest):
    return await ai_service.run_image_pipeline(request)











