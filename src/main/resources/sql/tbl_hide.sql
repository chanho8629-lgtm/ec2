-- ----------------------------------------------------------
-- 25. 숨기기 (tbl_hide)
-- ----------------------------------------------------------
drop table if exists tbl_hide cascade;

create table tbl_hide (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null,
    target_type varchar(255) not null,
    target_id   bigint      not null,
    created_datetime  timestamp   not null default now(),

    constraint uk_hide unique (member_id, target_type, target_id),
    constraint fk_hide_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_hide is '숨기기';
comment on column tbl_hide.id is 'PK';
comment on column tbl_hide.member_id is '숨긴 회원';
comment on column tbl_hide.target_type is '대상 타입 (WORK / GALLERY)';
comment on column tbl_hide.target_id is '대상 PK';
