-- ----------------------------------------------------------
-- 32. 예술관 태그 (tbl_gallery_tag)
-- ----------------------------------------------------------
drop table if exists tbl_gallery_tag cascade;

create table tbl_gallery_tag (
    id             bigint generated always as identity primary key,
    gallery_id     bigint    not null,
    tag_id         bigint    not null,

    constraint uk_gallery_tag unique (gallery_id, tag_id),
    constraint fk_gt_gallery foreign key (gallery_id)
    references tbl_gallery (id),
    constraint fk_gt_tag foreign key (tag_id)
    references tbl_tag (id)
);

comment on table  tbl_gallery_tag                is '예술관 태그';
comment on column tbl_gallery_tag.id             is 'PK';

create index idx_gt_tag on tbl_gallery_tag (tag_id);
