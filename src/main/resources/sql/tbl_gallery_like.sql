-- ----------------------------------------------------------
-- 22. 예술관 좋아요 (tbl_gallery_like)
-- ----------------------------------------------------------
drop table if exists tbl_gallery_like cascade;

create table tbl_gallery_like (
    id bigint generated always as identity primary key,
    gallery_id bigint not null,
    member_id bigint not null,
    created_datetime timestamp not null default now(),

    constraint uk_gallery_like unique (gallery_id, member_id),
    constraint fk_gallery_like_gallery foreign key (gallery_id)
        references tbl_gallery (id),
    constraint fk_gallery_like_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_gallery_like is '예술관 좋아요';
comment on column tbl_gallery_like.id is 'PK';
comment on column tbl_gallery_like.gallery_id is '예술관 FK';
comment on column tbl_gallery_like.member_id is '좋아요 한 회원 FK';

create index idx_gallery_like_gallery on tbl_gallery_like (gallery_id);
create index idx_gallery_like_member on tbl_gallery_like (member_id);
