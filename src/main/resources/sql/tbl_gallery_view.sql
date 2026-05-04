-- ----------------------------------------------------------
-- 20-1. 예술관 조회 로그 (tbl_gallery_view)
-- ----------------------------------------------------------
drop table if exists tbl_gallery_view cascade;

create table tbl_gallery_view (
    id               bigint generated always as identity primary key,
    gallery_id       bigint      not null,
    member_id        bigint      not null,
    viewed_at        timestamp   not null default now(),
    created_datetime timestamp   not null default now(),

    constraint fk_gallery_view_gallery foreign key (gallery_id)
        references tbl_gallery (id),
    constraint fk_gallery_view_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_gallery_view is '예술관 조회 로그';
comment on column tbl_gallery_view.id is '조회 로그 번호 (PK)';
comment on column tbl_gallery_view.gallery_id is '조회된 예술관 FK';
comment on column tbl_gallery_view.member_id is '조회한 회원 FK';
comment on column tbl_gallery_view.viewed_at is '조회 시각';
comment on column tbl_gallery_view.created_datetime is '생성 일시';

create index idx_gallery_view_gallery on tbl_gallery_view (gallery_id, viewed_at desc);
create index idx_gallery_view_member on tbl_gallery_view (member_id, viewed_at desc);
create index idx_gallery_view_member_gallery on tbl_gallery_view (member_id, gallery_id, viewed_at desc);
create index idx_gallery_view_viewed_at on tbl_gallery_view (viewed_at desc);
