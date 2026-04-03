-- ----------------------------------------------------------
-- 33. 예술관 작품 (tbl_gallery_work)
-- ----------------------------------------------------------
drop table if exists tbl_gallery_work cascade;

create table tbl_gallery_work (
    id              bigint generated always as identity primary key,
    gallery_id      bigint    not null,
    work_id         bigint    not null,
    sort_order      int   not null default 0,
    added_at        timestamp not null default now(),

    constraint uk_gallery_work unique (gallery_id, work_id),
    constraint fk_gw_gallery foreign key (gallery_id)
        references tbl_gallery (id),
    constraint fk_gw_work foreign key (work_id)
        references tbl_work (id)
);

comment on table  tbl_gallery_work                 is '예술관 작품';
comment on column tbl_gallery_work.id              is 'PK';
comment on column tbl_gallery_work.sort_order      is '전시 순서';

create index idx_gw_work on tbl_gallery_work (work_id);
