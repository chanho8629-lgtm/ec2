-- ----------------------------------------------------------
-- 4. 메시지 방 (tbl_message_room)
-- ----------------------------------------------------------
drop table if exists tbl_message_room cascade;

create table tbl_message_room (
    id              bigint generated always as identity primary key,
    created_datetime      timestamp not null default now(),
    updated_datetime      timestamp not null default now()
);

comment on table tbl_message_room is '메시지 방';
comment on column tbl_message_room.id is 'PK';

