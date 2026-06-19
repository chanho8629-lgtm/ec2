import asyncio
import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

from domain.Gallery import GallerySimilarityItem, GallerySimilarityRequest
from service.gallery_service import GalleryService


class GallerySimilarityTest(unittest.TestCase):
    def setUp(self):
        self.service = GalleryService()

    def test_similar_tags_rank_first(self):
        request = GallerySimilarityRequest(
            target=GallerySimilarityItem(
                id=1, title="디지털 자연", description="숲과 빛", tags=["자연", "AI"]
            ),
            candidates=[
                GallerySimilarityItem(
                    id=2, title="숲의 기록", description="자연의 빛", tags=["자연", "AI"]
                ),
                GallerySimilarityItem(
                    id=3, title="도시 자동차", description="야간 도로", tags=["자동차"]
                ),
            ],
            limit=2,
        )

        response = asyncio.run(self.service.recommend_similar(request))

        self.assertEqual(2, response.results[0].id)
        self.assertGreater(response.results[0].score, response.results[1].score)

    def test_target_is_excluded_from_results(self):
        target = GallerySimilarityItem(id=1, title="바다", tags=["해양"])
        request = GallerySimilarityRequest(
            target=target,
            candidates=[target, GallerySimilarityItem(id=2, title="파도", tags=["해양"])],
            limit=10,
        )

        response = asyncio.run(self.service.recommend_similar(request))

        self.assertEqual([2], [item.id for item in response.results])

    def test_limit_is_applied(self):
        request = GallerySimilarityRequest(
            target=GallerySimilarityItem(id=1, title="예술", tags=["작품"]),
            candidates=[
                GallerySimilarityItem(id=2, title="예술 작품"),
                GallerySimilarityItem(id=3, title="예술 전시"),
                GallerySimilarityItem(id=4, title="예술 공간"),
            ],
            limit=2,
        )

        response = asyncio.run(self.service.recommend_similar(request))

        self.assertEqual(2, len(response.results))


if __name__ == "__main__":
    unittest.main()
