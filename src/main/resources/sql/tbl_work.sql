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
    link_url      varchar(255)   null,
    view_count    int        not null default 0,
    like_count    int        not null default 0,
    save_count    int        not null default 0,
    comment_count int        not null default 0,
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
comment on column tbl_work.view_count is '조회수 (비정규화)';
comment on column tbl_work.like_count is '좋아요 수 (비정규화)';
comment on column tbl_work.save_count is '저장 수 (비정규화)';
comment on column tbl_work.comment_count is '댓글 수 (비정규화)';
comment on column tbl_work.status is '상태 (ACTIVE/HIDDEN/DELETED)';
comment on column tbl_work.deleted_datetime is '삭제 일시 (soft delete)';

create index idx_work_member on tbl_work (member_id);
create index idx_work_status on tbl_work (status, created_datetime desc);
create index idx_work_created on tbl_work (created_datetime desc);

select * from tbl_work;

delete from tbl_work;
