-- ----------------------------------------------------------
-- tbl_like -> tbl_work_like / tbl_gallery_like 마이그레이션
-- ----------------------------------------------------------

create table if not exists tbl_work_like (
    id bigint generated always as identity primary key,
    work_id bigint not null,
    member_id bigint not null,
    created_datetime timestamp not null default now(),
    constraint uk_work_like unique (work_id, member_id),
    constraint fk_work_like_work foreign key (work_id) references tbl_work (id),
    constraint fk_work_like_member foreign key (member_id) references tbl_member (id)
);

create index if not exists idx_work_like_work on tbl_work_like (work_id);
create index if not exists idx_work_like_member on tbl_work_like (member_id);

create table if not exists tbl_gallery_like (
    id bigint generated always as identity primary key,
    gallery_id bigint not null,
    member_id bigint not null,
    created_datetime timestamp not null default now(),
    constraint uk_gallery_like unique (gallery_id, member_id),
    constraint fk_gallery_like_gallery foreign key (gallery_id) references tbl_gallery (id),
    constraint fk_gallery_like_member foreign key (member_id) references tbl_member (id)
);

create index if not exists idx_gallery_like_gallery on tbl_gallery_like (gallery_id);
create index if not exists idx_gallery_like_member on tbl_gallery_like (member_id);

insert into tbl_work_like (work_id, member_id, created_datetime)
select l.target_id, l.member_id, l.created_datetime
from tbl_like l
where l.target_type = 'WORK'
on conflict (work_id, member_id) do nothing;

insert into tbl_gallery_like (gallery_id, member_id, created_datetime)
select l.target_id, l.member_id, l.created_datetime
from tbl_like l
where l.target_type = 'GALLERY'
on conflict (gallery_id, member_id) do nothing;
