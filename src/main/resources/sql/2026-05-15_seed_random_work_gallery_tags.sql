\encoding UTF8

-- 작품/예술관에 태그를 랜덤 매핑한다.
-- 각 작품과 예술관마다 3~6개 태그를 붙이며, 중복 실행해도 기존 매핑은 유지한다.

insert into tbl_work_tag (work_id, tag_id)
with tag_count as (
    select count(*)::int as total from tbl_tag
),
tag_pool as (
    select id, row_number() over (order by id)::int as rn
    from tbl_tag
),
work_slots as (
    select
        w.id as work_id,
        generate_series(1, 3 + (abs(hashtext(w.id::text || ':work-tag-count')) % 4)) as slot
    from tbl_work w
    where w.deleted_datetime is null
),
work_picks as (
    select distinct
        ws.work_id,
        1 + (abs(hashtext(ws.work_id::text || ':' || ws.slot::text || ':' || random()::text)) % tc.total) as tag_rn
    from work_slots ws
    cross join tag_count tc
)
select wp.work_id, tp.id
from work_picks wp
join tag_pool tp on tp.rn = wp.tag_rn
on conflict (work_id, tag_id) do nothing;

insert into tbl_gallery_tag (gallery_id, tag_id)
with tag_count as (
    select count(*)::int as total from tbl_tag
),
tag_pool as (
    select id, row_number() over (order by id)::int as rn
    from tbl_tag
),
gallery_slots as (
    select
        g.id as gallery_id,
        generate_series(1, 3 + (abs(hashtext(g.id::text || ':gallery-tag-count')) % 4)) as slot
    from tbl_gallery g
),
gallery_picks as (
    select distinct
        gs.gallery_id,
        1 + (abs(hashtext(gs.gallery_id::text || ':' || gs.slot::text || ':' || random()::text)) % tc.total) as tag_rn
    from gallery_slots gs
    cross join tag_count tc
)
select gp.gallery_id, tp.id
from gallery_picks gp
join tag_pool tp on tp.rn = gp.tag_rn
on conflict (gallery_id, tag_id) do nothing;
