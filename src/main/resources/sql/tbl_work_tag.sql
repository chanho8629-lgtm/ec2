-- ----------------------------------------------------------
-- 18. 작품 태그 (tbl_work_tag)
-- ----------------------------------------------------------
drop table if exists tbl_work_tag cascade;

create table tbl_work_tag (
    id          bigint generated always as identity primary key,
    work_id     bigint    not null,
    tag_id      bigint    not null,

    constraint uk_work_tag unique (work_id, tag_id),
    constraint fk_wt_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_wt_tag foreign key (tag_id)
        references tbl_tag (id)
);

comment on table tbl_work_tag is '작품 태그';
comment on column tbl_work_tag.id is 'PK';
comment on column tbl_work_tag.work_id is '작품 FK';
comment on column tbl_work_tag.tag_id is '태그 FK';

create index idx_wt_tag on tbl_work_tag (tag_id);

delete from tbl_work_tag;

with works as (
    select id, row_number() over (order by id) as rn
    from tbl_work
    where deleted_datetime is null
    order by id
    limit 40
),
tags as (
    select id, row_number() over (order by id) as rn
    from tbl_tag
    order by id
    limit 20
)
insert into tbl_work_tag (work_id, tag_id)
select works.id, tags.id
from works
join tags on ((works.rn + tags.rn) % 4 = 0)
on conflict (work_id, tag_id) do nothing;
