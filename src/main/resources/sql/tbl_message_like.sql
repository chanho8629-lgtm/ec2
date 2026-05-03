-- ----------------------------------------------------------
-- 30. 메시지 좋아요 (tbl_message_like)
-- ----------------------------------------------------------
drop table if exists tbl_message_like cascade;

create table tbl_message_like (
    id               bigint generated always as identity primary key,
    message_id       bigint    not null,
    member_id        bigint    not null,
    created_datetime timestamp not null default now(),

    constraint uk_message_like unique (message_id, member_id),
    constraint fk_message_like_message foreign key (message_id) references tbl_message (id),
    constraint fk_message_like_member foreign key (member_id) references tbl_member (id)
);

comment on table tbl_message_like is '메시지 좋아요';
comment on column tbl_message_like.id is 'PK';
comment on column tbl_message_like.message_id is '메시지 FK';
comment on column tbl_message_like.member_id is '좋아요 한 회원';

create index idx_message_like_message on tbl_message_like (message_id);
create index idx_message_like_member on tbl_message_like (member_id);
