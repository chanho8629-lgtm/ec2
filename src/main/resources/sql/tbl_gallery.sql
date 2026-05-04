-- ----------------------------------------------------------
-- 19. 예술관 (tbl_gallery)
-- ----------------------------------------------------------
drop table if exists tbl_gallery cascade;

create table tbl_gallery (
    id            bigint generated always as identity primary key,
    member_id     bigint       not null,
    title         varchar(255) not null,
    description   text         null,
    cover_image   text         null,
    allow_comment boolean      not null default true,
    show_similar  boolean      not null default true,
    work_count    int      not null default 0,
    like_count    int      not null default 0,
    comment_count int      not null default 0,
    view_count    int      not null default 0,
    status        varchar(255)  not null default 'EXHIBITING',
    created_datetime    timestamp    not null default now(),
    updated_datetime    timestamp    not null default now(),
    deleted_datetime    timestamp    null,

    constraint fk_gallery_member foreign key (member_id)
        references tbl_member (id)
);


-- DROP DATABASE tbl_gallery;



-- DROP TABLE tbl_gallery_tag;
-- DROP TABLE tbl_gallery;
-- DROP TABLE tbl_gallery_like;
-- DROP TABLE tbl_gallery_work;
-- alter table tbl_gallery alter column  cover_image type text;

comment on table tbl_gallery is '예술관';
comment on column tbl_gallery.id is '예술관 번호 (PK)';
comment on column tbl_gallery.member_id is '소유자 FK';
comment on column tbl_gallery.title is '제목';
comment on column tbl_gallery.description is '설명';
comment on column tbl_gallery.cover_image is '커버 이미지 URL 또는 data URL';
comment on column tbl_gallery.allow_comment is '댓글 허용';
comment on column tbl_gallery.show_similar is '비슷한 작품 표시';
comment on column tbl_gallery.work_count is '소속 작품 수 (비정규화)';
comment on column tbl_gallery.like_count is '좋아요 수 (비정규화)';
comment on column tbl_gallery.comment_count is '댓글 수 (비정규화)';
comment on column tbl_gallery.view_count is '조회수 (비정규화)';
comment on column tbl_gallery.status is '상태 (EXHIBITING/SCHEDULED/ENDED/DELETED)';
comment on column tbl_gallery.deleted_datetime is '삭제 일시';

create index idx_gallery_member on tbl_gallery (member_id);
create index idx_gallery_status on tbl_gallery (status, created_datetime desc);

