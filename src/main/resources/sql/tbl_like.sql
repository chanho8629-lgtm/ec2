-- ----------------------------------------------------------
-- 21. 좋아요 (tbl_like)
-- ----------------------------------------------------------
drop table if exists tbl_like cascade;

create table tbl_like (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null,
    target_type varchar(255) not null,
    target_id   bigint      not null,
    created_datetime  timestamp   not null default now(),

    constraint uk_like unique (member_id, target_type, target_id),
    constraint fk_like_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_like is '좋아요';
comment on column tbl_like.id is 'PK';
comment on column tbl_like.member_id is '좋아요 한 회원';
comment on column tbl_like.target_type is '대상 타입 (WORK)';
comment on column tbl_like.target_id is '대상 PK';

create index idx_like_target on tbl_like (target_type, target_id);
