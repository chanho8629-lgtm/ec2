-- ----------------------------------------------------------
-- 28. 메시지 방 참여자 (tbl_message_room_member)
-- ----------------------------------------------------------
drop table if exists tbl_message_room_member cascade;

create table tbl_message_room_member (
    id              bigint generated always as identity primary key,
    message_room_id bigint    not null,
    member_id       bigint    not null,
    joined_at       timestamp not null default now(),
    left_at         timestamp null,

    constraint uk_room_member unique (message_room_id, member_id),
    constraint fk_mrm_room foreign key (message_room_id)
        references tbl_message_room (id),
    constraint fk_mrm_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_message_room_member is '메시지 방 참여자';
comment on column tbl_message_room_member.id is 'PK';

create index idx_mrm_member on tbl_message_room_member (member_id);
