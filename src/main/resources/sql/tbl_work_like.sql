-- ----------------------------------------------------------
-- 21. 작품 좋아요 (tbl_work_like)
-- ----------------------------------------------------------
drop table if exists tbl_work_like cascade;

create table tbl_work_like (
    id bigint generated always as identity primary key,
    work_id bigint not null,
    member_id bigint not null,
    created_datetime timestamp not null default now(),

    constraint uk_work_like unique (work_id, member_id),
    constraint fk_work_like_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_work_like_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_work_like is '작품 좋아요';
comment on column tbl_work_like.id is 'PK';
comment on column tbl_work_like.work_id is '작품 FK';
comment on column tbl_work_like.member_id is '좋아요 한 회원 FK';

create index idx_work_like_work on tbl_work_like (work_id);
create index idx_work_like_member on tbl_work_like (member_id);
