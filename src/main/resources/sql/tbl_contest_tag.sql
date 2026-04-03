-- ----------------------------------------------------------
-- 34. 콘테스트 태그 (tbl_contest_tag)
-- ----------------------------------------------------------
drop table if exists tbl_contest_tag cascade;

create table tbl_contest_tag (
    id         bigint generated always as identity primary key,
    contest_id bigint    not null,
    tag_id     bigint    not null,

    constraint uk_contest_tag unique (contest_id, tag_id),
    constraint fk_ct_contest foreign key (contest_id)
        references tbl_contest (id),
    constraint fk_ct_tag foreign key (tag_id)
        references tbl_tag (id)
);

comment on table  tbl_contest_tag                is '콘테스트 태그';
comment on column tbl_contest_tag.id is 'PK';

create index idx_ct_tag on tbl_contest_tag (tag_id);
