-- ----------------------------------------------------------
-- 2. 태그 (tbl_tag)
-- ----------------------------------------------------------
drop table if exists tbl_tag cascade;

create table tbl_tag (
    id       bigint generated always as identity primary key,
    tag_name varchar(255)  not null,

    constraint uk_tag_name unique (tag_name)
);

comment on table tbl_tag is '태그';
comment on column tbl_tag.id is 'PK';
comment on column tbl_tag.tag_name is '태그명';
