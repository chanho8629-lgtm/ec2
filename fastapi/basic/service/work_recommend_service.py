import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import HTTPException

from database import db
from domain.Work import WorkRecommendRequest, WorkRecommendItem, WorkRecommendResponse

# 현재 갤러리 소속 작품을 제외한 활성 작품 + 썸네일 첫 번째 이미지
WORK_QUERY = """
WITH candidate_works AS (
    SELECT
        w.id,
        w.title,
        COALESCE(w.description, '') AS description,
        COALESCE(w.category, '') AS category,
        w.view_count,
        w.like_count,
        m.nickname AS member_nickname
    FROM tbl_work w
    LEFT JOIN tbl_member m ON m.id = w.member_id
    WHERE w.deleted_datetime IS NULL
      AND w.status = 'ACTIVE'
      AND NOT EXISTS (
          SELECT 1
          FROM tbl_gallery_work gw
          WHERE gw.gallery_id = $1
            AND gw.work_id = w.id
      )
    ORDER BY w.view_count DESC, w.like_count DESC, w.id DESC
    LIMIT 700
)
SELECT
    w.id,
    w.title,
    w.description,
    w.category,
    COALESCE(string_agg(DISTINCT t.tag_name, ' ' ORDER BY t.tag_name), '') AS tags,
    w.view_count,
    w.like_count,
    w.member_nickname,
    (
        SELECT wf.file_url
        FROM tbl_work_file wf
        WHERE wf.work_id = w.id
        ORDER BY CASE WHEN wf.file_type LIKE 'image/%' THEN 0 ELSE 1 END,
                 wf.sort_order ASC, wf.id ASC
        LIMIT 1
    ) AS thumbnail_url
FROM candidate_works w
LEFT JOIN tbl_work_tag wt ON wt.work_id = w.id
LEFT JOIN tbl_tag t        ON t.id = wt.tag_id
GROUP BY w.id, w.title, w.description, w.category, w.view_count, w.like_count, w.member_nickname
ORDER BY w.view_count DESC, w.like_count DESC, w.id DESC
"""


class WorkRecommendService:

    async def recommend(self, request: WorkRecommendRequest) -> WorkRecommendResponse:
        try:
            async with db.get_connection() as conn:
                rows = await conn.fetch(WORK_QUERY, request.gallery_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DB 조회 실패: {e}")

        if not rows:
            return WorkRecommendResponse(recommendations=[])

        work_texts = [
            f"{r['title']} {r['title']} {r['category']} {r['description']} {r['tags']}"
            for r in rows
        ]

        query_text = request.content or ""
        corpus = work_texts

        tfidf_v = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(2, 4),
            max_features=6000,
            min_df=1,
        )
        tfidf_mat = tfidf_v.fit_transform(corpus)
        query_mat = tfidf_v.transform([query_text])

        sim_scores  = cosine_similarity(query_mat, tfidf_mat)[0]
        top_n       = max(1, min(request.top_n, len(rows)))

        # 상위 pool(top_n × 3)에서 랜덤 섞어 추천 다양성 확보
        pool_size   = min(top_n * 3, len(rows))
        pool_indices = sim_scores.argsort()[::-1][:pool_size].tolist()
        random.shuffle(pool_indices)
        top_indices = pool_indices[:top_n]

        # 중복 제거 (ID 기준)
        seen_ids: set[int] = set()
        recommendations = []
        for i in top_indices:
            work_id = int(rows[i]["id"])
            if work_id in seen_ids:
                continue
            seen_ids.add(work_id)
            recommendations.append(
                WorkRecommendItem(
                    id=work_id,
                    title=str(rows[i]["title"]),
                    viewCount=int(rows[i]["view_count"]),
                    likeCount=int(rows[i]["like_count"]),
                    similarity=float(sim_scores[i]),
                    memberNickname=rows[i]["member_nickname"] or "",
                    thumbnailUrl=rows[i]["thumbnail_url"] or "",
                )
            )

        return WorkRecommendResponse(recommendations=recommendations)
