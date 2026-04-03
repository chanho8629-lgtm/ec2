-- ----------------------------------------------------------
-- 11. 작품 조회 로그 (tbl_work_view)
-- ----------------------------------------------------------
drop table if exists tbl_work_view cascade;

create table tbl_work_view (
    id               bigint generated always as identity primary key,
    work_id          bigint      not null,
    member_id        bigint      not null,
    viewed_at        timestamp   not null default now(),
    created_datetime timestamp   not null default now(),

    constraint fk_work_view_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_work_view_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_work_view is '작품 조회 로그';
comment on column tbl_work_view.id is '조회 로그 번호 (PK)';
comment on column tbl_work_view.work_id is '조회된 작품 FK';
comment on column tbl_work_view.member_id is '조회한 회원 FK';
comment on column tbl_work_view.viewed_at is '조회 시각';
comment on column tbl_work_view.created_datetime is '생성 일시';

-- 뷰 만듬
create index idx_work_view_work on tbl_work_view (work_id, viewed_at desc);
create index idx_work_view_member on tbl_work_view (member_id, viewed_at desc);
create index idx_work_view_member_work on tbl_work_view (member_id, work_id, viewed_at desc);
create index idx_work_view_viewed_at on tbl_work_view (viewed_at desc);
