from pydantic import BaseModel, Field
from typing import Optional


# 이미지 생성 요청 DTO
class ImageGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    size: str = "1024x1024"


# 이미지 생성 응답 DTO
class ImageGenerateResponse(BaseModel):
    image_path: str
    image_key: Optional[str] = None
    image_url: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None


# 이미지 분석 요청 DTO
class ImageAnalyzeRequest(BaseModel):
    image_path: str = Field(..., min_length=1)


# 이미지 분석 응답 DTO
class ImageAnalyzeResponse(BaseModel):
    description: str
    cache_hit: bool


# Bideo 이미지 파이프라인 요청 DTO
class ImagePipelineRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    size: str = "1024x1024"


# Bideo 이미지 파이프라인 응답 DTO
class ImagePipelineResponse(BaseModel):
    image_path: str
    description: str
    regenerated_image_path: str
    cache_hit: bool
    image_key: Optional[str] = None
    image_url: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
