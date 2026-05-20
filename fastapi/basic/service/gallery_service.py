import math
import re
from collections import Counter

from domain.Gallery import (
    GallerySimilarityItem,
    GallerySimilarityRequest,
    GallerySimilarityResponse,
    GallerySimilarityResult,
)


class GalleryService:
    def __init__(self):
        pass

    async def recommend_similar(self, request: GallerySimilarityRequest) -> GallerySimilarityResponse:
        target_vector = self._vectorize(request.target)
        results: list[GallerySimilarityResult] = []

        for candidate in request.candidates:
            if candidate.id == request.target.id:
                continue
            score = self._cosine(target_vector, self._vectorize(candidate))
            if score <= 0:
                score = self._tag_overlap_score(request.target, candidate)
            results.append(GallerySimilarityResult(id=candidate.id, score=round(float(score), 6)))

        results.sort(key=lambda item: item.score, reverse=True)
        return GallerySimilarityResponse(results=results[:request.limit])

    def _vectorize(self, item: GallerySimilarityItem) -> Counter:
        tokens: list[str] = []
        tokens.extend(self._tokenize(item.title) * 4)
        tokens.extend(self._tokenize(item.description) * 2)
        for tag in item.tags:
            tokens.extend(self._tokenize(tag) * 5)
        for work in item.works:
            tokens.extend(self._tokenize(work))
        return Counter(tokens)

    def _tokenize(self, text: str) -> list[str]:
        normalized = (text or "").strip().lower()
        if not normalized:
            return []

        word_tokens = [
            token
            for token in re.split(r"[^0-9a-zA-Z가-힣]+", normalized)
            if len(token) >= 2
        ]
        compact = re.sub(r"\s+", "", normalized)
        char_tokens = [
            compact[index:index + size]
            for size in (2, 3)
            for index in range(max(0, len(compact) - size + 1))
        ]
        return word_tokens + char_tokens

    def _cosine(self, left: Counter, right: Counter) -> float:
        if not left or not right:
            return 0.0
        common = set(left) & set(right)
        numerator = sum(left[token] * right[token] for token in common)
        left_norm = math.sqrt(sum(value * value for value in left.values()))
        right_norm = math.sqrt(sum(value * value for value in right.values()))
        if left_norm == 0 or right_norm == 0:
            return 0.0
        return numerator / (left_norm * right_norm)

    def _tag_overlap_score(self, target: GallerySimilarityItem, candidate: GallerySimilarityItem) -> float:
        target_tags = {tag.strip().lower() for tag in target.tags if tag and tag.strip()}
        candidate_tags = {tag.strip().lower() for tag in candidate.tags if tag and tag.strip()}
        if not target_tags or not candidate_tags:
            return 0.0
        return len(target_tags & candidate_tags) / len(target_tags | candidate_tags)
