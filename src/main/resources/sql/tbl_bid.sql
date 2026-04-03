-- ----------------------------------------------------------
-- 37. 입찰 (tbl_bid)
-- ----------------------------------------------------------
drop table if exists tbl_bid cascade;

create table tbl_bid (
    id         bigint generated always as identity primary key,
    auction_id bigint        not null,
    member_id  bigint        not null,
    bid_price  int not null,
    is_winning boolean       not null default false,
    created_datetime timestamp     not null default now(),

    constraint fk_bid_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_bid_member foreign key (member_id)
        references tbl_member (id),
    constraint chk_bid_price check (bid_price > 0)
);

comment on table  tbl_bid            is '입찰';
comment on column tbl_bid.id         is 'PK';
comment on column tbl_bid.auction_id is '경매 FK';
comment on column tbl_bid.member_id  is '입찰자 FK';
comment on column tbl_bid.bid_price  is '입찰 금액';
comment on column tbl_bid.is_winning is '최고가 여부';

create index idx_bid_auction on tbl_bid (auction_id, bid_price desc);
create index idx_bid_member  on tbl_bid (member_id);
