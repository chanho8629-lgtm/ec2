-- ----------------------------------------------------------
-- 10. 작품 (tbl_work)
-- ----------------------------------------------------------
drop table if exists tbl_work cascade;

create table tbl_work (
    id            bigint generated always as identity primary key,
    member_id     bigint         not null,
    title         varchar(255)   not null,
    category      varchar(100)   null,
    description   text           null,
    price         int  null,
    license_type  varchar(100)   null,
    license_terms text           null,
    is_tradable   boolean        not null default false,
    allow_comment boolean        not null default true,
    show_similar  boolean        not null default true,
    link_url      varchar(500)   null,
    thumbnail     varchar(500)   null,
    view_count    int        not null default 0,
    like_count    int        not null default 0,
    save_count    int        not null default 0,
    comment_count int        not null default 0,
    media_type    varchar(100) null,
    title_length  int        not null default 0,
    description_length int   not null default 0,
    tag_count     int        not null default 0,
    thumbnail_exists boolean not null default false,
    is_ai_generated boolean not null default false,
    ai_quality_score double precision not null default 0,
    predicted_views bigint  not null default 0,
    predicted_like_count int not null default 0,
    predicted_popular int   not null default 0,
    predicted_popular_probability double precision not null default 0,
    video_length_sec int not null default 0,
    age_days int not null default 0,
    watch_completion_rate double precision not null default 0,
    engagement_score int not null default 0,
    reaction_score int not null default 0,
    quality_completion_score double precision not null default 0,
    short_video_score double precision not null default 0,
    training_feature_version varchar(50) not null default 'v1',
    status        varchar(255)    not null default 'ACTIVE',
    created_datetime    timestamp      not null default now(),
    updated_datetime    timestamp      not null default now(),
    deleted_datetime    timestamp      null,

    constraint fk_work_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_work is '작품';
comment on column tbl_work.id is '작품 번호 (PK)';
comment on column tbl_work.member_id is '작성자 FK';
comment on column tbl_work.title is '제목';
comment on column tbl_work.category is '카테고리';
comment on column tbl_work.description is '설명';
comment on column tbl_work.price is '가격 (거래 토글 ON 시)';
comment on column tbl_work.license_type is '라이선스 유형 (PERSONAL / COMMERCIAL / EXCLUSIVE)';
comment on column tbl_work.license_terms is '라이선스 상세 조건';
comment on column tbl_work.is_tradable is '거래 가능 여부';
comment on column tbl_work.allow_comment is '댓글 허용';
comment on column tbl_work.show_similar is '비슷한 작품 표시';
comment on column tbl_work.link_url is '외부 링크 URL';
comment on column tbl_work.thumbnail is '썸네일 이미지 URL';
comment on column tbl_work.view_count is '조회수 (비정규화)';
comment on column tbl_work.like_count is '좋아요 수 (비정규화)';
comment on column tbl_work.save_count is '저장 수 (비정규화)';
comment on column tbl_work.comment_count is '댓글 수 (비정규화)';
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
comment on column tbl_work.status is '상태 (ACTIVE/HIDDEN/DELETED)';
comment on column tbl_work.deleted_datetime is '삭제 일시 (soft delete)';

create index idx_work_member on tbl_work (member_id);
create index idx_work_status on tbl_work (status, created_datetime desc);
create index idx_work_created on tbl_work (created_datetime desc);

select * from tbl_work;

delete from tbl_work;
