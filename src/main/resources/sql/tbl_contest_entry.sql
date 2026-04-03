-- ----------------------------------------------------------
-- 35. 콘테스트 출품 (tbl_contest_entry)
-- ----------------------------------------------------------
drop table if exists tbl_contest_entry cascade;

create table tbl_contest_entry (
    id           bigint generated always as identity primary key,
    contest_id   bigint      not null,
    work_id      bigint      not null,
    member_id    bigint      not null,
    award_rank   varchar(255) null,
    submitted_at timestamp   not null default now(),

    constraint uk_contest_entry unique (contest_id, work_id),
    constraint fk_ce_contest foreign key (contest_id)
        references tbl_contest (id),
    constraint fk_ce_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_ce_member foreign key (member_id)
        references tbl_member (id)
);

comment on table  tbl_contest_entry                  is '콘테스트 출품';
comment on column tbl_contest_entry.id         is 'PK';
comment on column tbl_contest_entry.contest_id is '콘테스트 FK';
comment on column tbl_contest_entry.work_id    is '출품 작품 FK';
comment on column tbl_contest_entry.member_id  is '출품자 FK';
comment on column tbl_contest_entry.award_rank       is '수상 순위 (금/은/동/입선 등)';

create index idx_ce_work   on tbl_contest_entry (work_id);
create index idx_ce_member on tbl_contest_entry (member_id);
