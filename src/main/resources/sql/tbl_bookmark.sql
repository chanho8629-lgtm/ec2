-- ----------------------------------------------------------
-- 22. 북마크 (tbl_bookmark)
-- ----------------------------------------------------------
drop table if exists tbl_bookmark cascade;

create table tbl_bookmark (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null,
    target_type varchar(255) not null,
    target_id   bigint      not null,
    created_datetime  timestamp   not null default now(),

    constraint uk_bookmark unique (member_id, target_type, target_id),
    constraint fk_bookmark_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_bookmark is '북마크';
comment on column tbl_bookmark.id is 'PK';
comment on column tbl_bookmark.member_id is '저장한 회원';
comment on column tbl_bookmark.target_type is '대상 타입 (WORK / GALLERY / CONTEST)';
comment on column tbl_bookmark.target_id is '대상 PK';

create index idx_bookmark_target on tbl_bookmark (target_type, target_id);

select * from tbl_bookmark
