from typing import List

from pydantic import BaseModel, Field


class GallerySimilarityItem(BaseModel):
    id: int
    title: str = ""
    description: str = ""
    tags: List[str] = Field(default_factory=list)
    works: List[str] = Field(default_factory=list)


class GallerySimilarityRequest(BaseModel):
    target: GallerySimilarityItem
    candidates: List[GallerySimilarityItem] = Field(default_factory=list)
    limit: int = Field(default=20, ge=1, le=100)


class GallerySimilarityResult(BaseModel):
    id: int
    score: float


class GallerySimilarityResponse(BaseModel):
    results: List[GallerySimilarityResult]
