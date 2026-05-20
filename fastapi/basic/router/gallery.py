from fastapi import APIRouter, status

from domain.Gallery import GallerySimilarityRequest, GallerySimilarityResponse
from service.gallery_service import GalleryService


router = APIRouter(prefix="/api/gallery", tags=["Gallery"])

gallery_service = GalleryService()


@router.post("/similarity", response_model=GallerySimilarityResponse, status_code=status.HTTP_200_OK)
async def recommend_similar_galleries(request: GallerySimilarityRequest):
    return await gallery_service.recommend_similar(request)
