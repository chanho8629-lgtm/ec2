-- ----------------------------------------------------------
-- 9. 알림 설정 (tbl_notification_setting)
-- ----------------------------------------------------------
drop table if exists tbl_notification_setting cascade;

create table tbl_notification_setting (
    id                  bigint generated always as identity primary key,
    member_id           bigint      not null,
    follow_notify       boolean     not null default true,
    like_bookmark_notify boolean    not null default true,
    comment_mention_notify boolean  not null default true,
    auction_notify      boolean     not null default true,
    payment_settlement_notify boolean not null default true,
    contest_notify      boolean     not null default true,
    pause_all           boolean     not null default false,
    created_datetime          timestamp   not null default now(),
    updated_datetime          timestamp   not null default now(),

    constraint uk_ns_member unique (member_id),
    constraint fk_ns_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_notification_setting is '알림 설정';
comment on column tbl_notification_setting.id is 'PK';
comment on column tbl_notification_setting.member_id is '회원 FK';
comment on column tbl_notification_setting.follow_notify is '팔로우 알림';
comment on column tbl_notification_setting.like_bookmark_notify is '좋아요 및 찜 알림';
comment on column tbl_notification_setting.comment_mention_notify is '댓글 및 멘션 알림';
comment on column tbl_notification_setting.auction_notify is '경매 알림';
comment on column tbl_notification_setting.payment_settlement_notify is '결제 및 정산 알림';
comment on column tbl_notification_setting.contest_notify is '공모전 알림';
comment on column tbl_notification_setting.pause_all is '모두 일시 중단 (0/1)';
