from fastapi import APIRouter, status

from domain.Work import (
    WorkClassificationRequest,
    WorkClassificationResponse,
    WorkRegressionFeatures,
    WorkRegressionResponse,
    WorkRecommendRequest,
    WorkRecommendResponse,
    WorkSimilarityRequest,
    WorkSimilarityResponse,
)
from service.work_service import WorkService
from service.gallery_service import GalleryService
from service.work_recommend_service import WorkRecommendService

router = APIRouter(prefix="/api/work", tags=["Work"])

work_service = WorkService()
_gallery_service = GalleryService()
_work_recommend_service = WorkRecommendService()


@router.post("/regression", response_model=WorkRegressionResponse, status_code=status.HTTP_200_OK)
async def predict_work_views(features: WorkRegressionFeatures):
    return await work_service.predict_views(features)


@router.post("/classification", response_model=WorkClassificationResponse, status_code=status.HTTP_200_OK)
async def classify_work_popular(request: WorkClassificationRequest):
    return await work_service.classify_popular(request)


@router.post("/recommend", response_model=WorkRecommendResponse, status_code=status.HTTP_200_OK)
async def recommend_similar_works(request: WorkRecommendRequest):
    """현재 갤러리에 없는 작품 중 유사도 높은 작품 추천 (TF-IDF + Kiwi)"""
    return await _work_recommend_service.recommend(request)


@router.post("/similarity", response_model=WorkSimilarityResponse, status_code=status.HTTP_200_OK)
async def find_similar_works(request: WorkSimilarityRequest):
    from domain.Gallery import GallerySimilarityItem, GallerySimilarityRequest, GallerySimilarityResponse
    from domain.Work import WorkSimilarityResult

    gallery_target = GallerySimilarityItem(
        id=request.target.id,
        title=request.target.title,
        description=f"{request.target.category} {request.target.description}".strip(),
        tags=request.target.tags,
        works=[],
    )
    gallery_candidates = [
        GallerySimilarityItem(
            id=c.id,
            title=c.title,
            description=f"{c.category} {c.description}".strip(),
            tags=c.tags,
            works=[],
        )
        for c in request.candidates
        if c.id != request.target.id
    ]
    gallery_req = GallerySimilarityRequest(
        target=gallery_target,
        candidates=gallery_candidates,
        limit=request.limit,
    )
    gallery_resp = await _gallery_service.recommend_similar(gallery_req)
    return WorkSimilarityResponse(
        results=[WorkSimilarityResult(id=r.id, score=r.score) for r in gallery_resp.results]
    )

