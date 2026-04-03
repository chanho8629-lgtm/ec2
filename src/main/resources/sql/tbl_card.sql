-- ----------------------------------------------------------
-- 13. 카드 (tbl_card)
-- ----------------------------------------------------------
drop table if exists tbl_card cascade;

create table tbl_card (
    id                 bigint generated always as identity primary key,
    member_id          bigint       not null,
    card_company       varchar(255)  not null,
    card_number_masked varchar(255)  not null,
    billing_key        varchar(255) null,
    is_default         boolean      not null default false,
    created_datetime         timestamp    not null default now(),
    deleted_datetime         timestamp    null,

    constraint fk_card_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_card is '카드';
comment on column tbl_card.id is 'PK';
comment on column tbl_card.member_id is '회원 FK';
comment on column tbl_card.card_company is '카드사';
comment on column tbl_card.card_number_masked is '마스킹된 카드번호 (****-****-****-1234)';
comment on column tbl_card.billing_key is 'PG 빌링키 (암호화 저장)';
comment on column tbl_card.is_default is '기본 카드 여부';
comment on column tbl_card.deleted_datetime is '삭제 일시';

create index idx_card_member on tbl_card (member_id);
