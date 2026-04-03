-- ----------------------------------------------------------
-- 7. 회원 관심 태그 (tbl_member_tag)
-- ----------------------------------------------------------
drop table if exists tbl_member_tag cascade;

create table tbl_member_tag (
    id            bigint generated always as identity primary key,
    member_id     bigint    not null,
    tag_id        bigint    not null,

    constraint uk_member_tag unique (member_id, tag_id),
    constraint fk_mt_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_mt_tag foreign key (tag_id)
        references tbl_tag (id)
);

comment on table tbl_member_tag is '회원 관심 태그';
comment on column tbl_member_tag.id is 'PK';

create index idx_mt_tag on tbl_member_tag (tag_id);
