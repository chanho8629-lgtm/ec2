alter table tbl_work
    add column if not exists media_type varchar(100),
    add column if not exists title_length int not null default 0,
    add column if not exists description_length int not null default 0,
    add column if not exists tag_count int not null default 0,
    add column if not exists thumbnail_exists boolean not null default false,
    add column if not exists is_ai_generated boolean not null default false,
    add column if not exists ai_quality_score double precision not null default 0,
    add column if not exists predicted_views bigint not null default 0,
    add column if not exists predicted_like_count int not null default 0,
    add column if not exists predicted_popular int not null default 0,
    add column if not exists predicted_popular_probability double precision not null default 0,
    add column if not exists video_length_sec int not null default 0,
    add column if not exists age_days int not null default 0,
    add column if not exists watch_completion_rate double precision not null default 0,
    add column if not exists engagement_score int not null default 0,
    add column if not exists reaction_score int not null default 0,
    add column if not exists quality_completion_score double precision not null default 0,
    add column if not exists short_video_score double precision not null default 0,
    add column if not exists training_feature_version varchar(50) not null default 'v1';

comment on column tbl_work.media_type is '등록 파일 MIME 타입 또는 분류';
comment on column tbl_work.title_length is '등록 시 제목 길이';
comment on column tbl_work.description_length is '등록 시 설명 길이';
comment on column tbl_work.tag_count is '등록 시 태그 수';
comment on column tbl_work.thumbnail_exists is '등록 시 썸네일 사용 여부';
comment on column tbl_work.is_ai_generated is 'AI 생성 이미지 사용 여부';
comment on column tbl_work.ai_quality_score is '등록 시 AI 품질 점수 feature';
comment on column tbl_work.predicted_views is '등록 시 회귀 예측 조회수';
comment on column tbl_work.predicted_like_count is '등록 시 예측 좋아요 수';
comment on column tbl_work.predicted_popular is '등록 시 분류 예측값';
comment on column tbl_work.predicted_popular_probability is '등록 시 고조회수 확률';
comment on column tbl_work.video_length_sec is '학습 feature: 영상 길이(초), 이미지/미상은 0';
comment on column tbl_work.age_days is '학습 feature: 업로드 후 경과일';
comment on column tbl_work.watch_completion_rate is '학습 feature: 추정 완주율';
comment on column tbl_work.engagement_score is '학습 feature: 좋아요/댓글/저장 기반 참여 점수';
comment on column tbl_work.reaction_score is '학습 feature: 사용자 반응 합계';
comment on column tbl_work.quality_completion_score is '학습 feature: 품질 점수와 완주율 결합값';
comment on column tbl_work.short_video_score is '학습 feature: 숏폼 가중치';
comment on column tbl_work.training_feature_version is '학습 feature 산출 버전';
