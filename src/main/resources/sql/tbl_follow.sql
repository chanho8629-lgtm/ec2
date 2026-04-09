-- ----------------------------------------------------------
-- 11. 팔로우 (tbl_follow)
-- ----------------------------------------------------------
drop table if exists tbl_follow cascade;

create table tbl_follow (
    id           bigint generated always as identity primary key,
    follower_id  bigint      not null,
    following_id bigint      not null,
    created_datetime   timestamp   not null default now(),

    constraint uk_follow unique (follower_id, following_id),
    constraint chk_follow_self check (follower_id <> following_id),
    constraint fk_follow_follower foreign key (follower_id)
        references tbl_member (id),
    constraint fk_follow_following foreign key (following_id)
        references tbl_member (id)
);

comment on table tbl_follow is '팔로우';
comment on column tbl_follow.id is 'PK';
comment on column tbl_follow.follower_id is '팔로우 하는 사람';
comment on column tbl_follow.following_id is '팔로우 당하는 사람';

create index idx_follow_following on tbl_follow (following_id);

select * from tbl_follow;
