-- ----------------------------------------------------------
-- 27. 알림 (tbl_notification)
-- ----------------------------------------------------------
drop table if exists tbl_notification cascade;

create table tbl_notification (
    id              bigint generated always as identity primary key,
    member_id       bigint       not null,
    sender_id       bigint       null,
    noti_type       varchar(255)  not null,
    target_type     varchar(255)  null,
    target_id       bigint       null,
    message         varchar(255) not null,
    is_read         boolean      not null default false,
    created_datetime      timestamp    not null default now(),

    constraint fk_noti_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_noti_sender foreign key (sender_id)
        references tbl_member (id)
);

comment on table tbl_notification is '알림';
comment on column tbl_notification.id is 'PK';
comment on column tbl_notification.member_id is '수신자 FK';
comment on column tbl_notification.sender_id is '발신자 FK (시스템 알림은 NULL)';
comment on column tbl_notification.noti_type is '알림 타입 (LIKE/COMMENT/FOLLOW/BID/AUCTION_END/SETTLEMENT 등)';
comment on column tbl_notification.target_type is '대상 타입';
comment on column tbl_notification.target_id is '대상 PK';
comment on column tbl_notification.message is '알림 메시지';
comment on column tbl_notification.is_read is '읽음 여부';

create index idx_noti_member on tbl_notification (member_id, is_read, created_datetime desc);
