from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class WorkRecommendRequest(BaseModel):
    gallery_id: int
    content: str        # gallery title + description + tags 합친 텍스트
    top_n: int = 6


class WorkRecommendItem(BaseModel):
    id: int
    title: str
    viewCount: int
    likeCount: int
    similarity: float
    memberNickname: Optional[str] = ""
    thumbnailUrl: Optional[str] = ""


class WorkRecommendResponse(BaseModel):
    recommendations: List[WorkRecommendItem]


class WorkSimilarityItem(BaseModel):
    id: int
    title: str = ""
    category: str = ""
    description: str = ""
    tags: List[str] = Field(default_factory=list)


class WorkSimilarityRequest(BaseModel):
    target: WorkSimilarityItem
    candidates: List[WorkSimilarityItem] = Field(default_factory=list)
    limit: int = Field(default=6, ge=1, le=100)


class WorkSimilarityResult(BaseModel):
    id: int
    score: float


class WorkSimilarityResponse(BaseModel):
    results: List[WorkSimilarityResult]


# 조회수 회귀 모델에 전달할 입력 DTO
# bideo_regressor_features.pkl에 저장된 feature 순서와 이름을 기준으로 사용한다.
class WorkRegressionFeatures(BaseModel):
    # 영상 기본 정보
    video_length_sec: int
    age_days: int

    # 사용자 반응 수치
    likes: int
    comments: int
    shares: int
    watch_completion_rate: float
    ai_quality_score: float

    # 중요 feature: 조회수 대비 반응 비율
    # like_ratio: 조회수 중 좋아요 비율, 모델에서 가장 영향이 큰 feature
    # comment_ratio: 조회수 중 댓글 비율
    # share_ratio: 조회수 중 공유 비율
    like_ratio: float
    comment_ratio: float
    share_ratio: float

    # 중요 feature: 전체 반응량
    # engagement_score: 좋아요, 댓글, 공유를 합산한 참여 점수
    # reaction_score: 사용자 반응 합계
    engagement_score: int
    upload_month: int
    upload_dayofweek: int
    upload_year: int
    reaction_score: int

    # 중요 feature: 업로드 경과일 기준 일평균 반응
    likes_per_day: float
    comments_per_day: float
    shares_per_day: float
    engagement_per_day: float

    # 중요 feature: 로그 변환 반응값
    # log_likes: 좋아요 수를 로그 변환한 값, like_ratio 다음으로 영향이 컸던 feature
    quality_completion_score: float
    short_video_score: float
    log_likes: float
    log_comments: float
    log_shares: float
    log_engagement_score: float


# 조회수 회귀 예측 API 응답 데이터
class WorkRegressionResponse(BaseModel):
    predicted_views: int
    created_datetime: datetime
    updated_datetime: datetime


# 조회수 인기 여부 분류 모델에 전달할 입력 DTO
# bideo-분류.ipynb 기준: views 중앙값 27,808회 이상이면 1(고조회수), 미만이면 0(저조회수)
class WorkClassificationRequest(BaseModel):
    # 문자열 feature는 service에서 저장된 LabelEncoder로 숫자 변환한다.
    category: str = Field(..., min_length=1, max_length=100)
    quality: str = Field(..., min_length=1, max_length=50)
    license_type: str = Field(..., min_length=1, max_length=50)
    creator_tier: str = Field(..., min_length=1, max_length=50)

    # 영상 기본 정보
    video_length_sec: int = Field(..., ge=1)
    age_days: int = Field(..., ge=0)

    # 사용자 반응 수치
    likes: int = Field(..., ge=0)
    comments: int = Field(..., ge=0)
    shares: int = Field(..., ge=0)
    watch_completion_rate: float = Field(..., ge=0, le=1)
    ai_quality_score: float = Field(..., ge=0, le=100)

    # 경매 반응 수치
    starting_bid: int = Field(..., ge=0)
    bidder_count: int = Field(..., ge=0)
    bid_count: int = Field(..., ge=0)
    final_bid_price: int = Field(..., ge=0)

    # 중요 feature: 반응량과 경매 효율
    # engagement_score: 좋아요, 댓글, 공유를 합산한 참여 점수
    # price_gap: 최종 낙찰가와 시작가의 차이
    # engagement_per_bidder: 입찰자 1명당 참여 점수
    # bid_to_starting_ratio: 시작가 대비 최종 낙찰가 비율
    engagement_score: int = Field(..., ge=0)
    price_gap: int
    engagement_per_bidder: float
    bid_to_starting_ratio: float


# 조회수 인기 여부 분류 API 응답 데이터
class WorkClassificationResponse(BaseModel):
    predicted_popular: int
    predicted_label: str
    popular_probability: float
    threshold: float
    created_datetime: datetime
    updated_datetime: datetime
