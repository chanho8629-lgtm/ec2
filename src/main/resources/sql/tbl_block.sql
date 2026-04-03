-- ----------------------------------------------------------
-- 12. 차단 (tbl_block)
-- ----------------------------------------------------------
drop table if exists tbl_block cascade;

create table tbl_block (
    id          bigint generated always as identity primary key,
    blocker_id  bigint      not null,
    blocked_id  bigint      not null,
    created_datetime  timestamp   not null default now(),

    constraint uk_block unique (blocker_id, blocked_id),
    constraint chk_block_self check (blocker_id <> blocked_id),
    constraint fk_block_blocker foreign key (blocker_id)
        references tbl_member (id),
    constraint fk_block_blocked foreign key (blocked_id)
        references tbl_member (id)
);

comment on table tbl_block is '차단';
comment on column tbl_block.id is 'PK';
comment on column tbl_block.blocker_id is '차단한 회원';
comment on column tbl_block.blocked_id is '차단당한 회원';

create index idx_block_blocked on tbl_block (blocked_id);

select * from tbl_block;
