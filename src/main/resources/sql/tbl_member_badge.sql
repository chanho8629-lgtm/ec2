-- ----------------------------------------------------------
-- 8. 회원 뱃지 (tbl_member_badge)
-- ----------------------------------------------------------
drop table if exists tbl_member_badge cascade;

create table tbl_member_badge (
    id              bigint generated always as identity primary key,
    member_id       bigint    not null,
    badge_id        bigint    not null,
    is_displayed    boolean   not null default false,
    earned_at       timestamp not null default now(),

    constraint uk_mb unique (member_id, badge_id),
    constraint fk_mb_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_mb_badge foreign key (badge_id)
        references tbl_badge (id)
);

comment on table tbl_member_badge is '회원 뱃지';
comment on column tbl_member_badge.id is 'PK';
comment on column tbl_member_badge.is_displayed is '프로필 표시 여부 (max 2)';

create index idx_mb_badge on tbl_member_badge (badge_id);
