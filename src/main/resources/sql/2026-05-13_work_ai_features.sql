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
    add column if not exists predicted_popular_probability double precision not null default 0;

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
