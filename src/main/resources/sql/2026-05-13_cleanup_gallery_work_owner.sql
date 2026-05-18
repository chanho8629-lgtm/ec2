delete from tbl_gallery_work gw
using tbl_gallery g, tbl_work w
where g.id = gw.gallery_id
  and w.id = gw.work_id
  and g.member_id <> w.member_id;

update tbl_gallery g
set work_count = coalesce(c.work_count, 0),
    updated_datetime = now()
from (
    select g2.id as gallery_id, count(gw.work_id)::int as work_count
    from tbl_gallery g2
    left join tbl_gallery_work gw on gw.gallery_id = g2.id
    group by g2.id
) c
where c.gallery_id = g.id;
