-- ----------------------------------------------------------
-- 3. 뱃지 마스터 (tbl_badge)
-- ----------------------------------------------------------
drop table if exists tbl_badge cascade;

create table tbl_badge (
    id          bigint generated always as identity primary key,
    badge_key   varchar(255)  not null,
    badge_name  varchar(255) not null,
    image_file  varchar(255) not null,
    description varchar(255) null,

    constraint uk_badge_key unique (badge_key)
);

comment on table tbl_badge is '뱃지 마스터';
comment on column tbl_badge.id is 'PK';
comment on column tbl_badge.badge_key is '뱃지 식별 키';
comment on column tbl_badge.badge_name is '뱃지 표시명';
comment on column tbl_badge.image_file is '이미지 파일명';
comment on column tbl_badge.description is '획득 조건 설명';
