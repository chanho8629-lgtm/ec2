-- ----------------------------------------------------------
-- 36. 경매 (tbl_auction)
-- ----------------------------------------------------------
drop table if exists tbl_auction cascade;

create table tbl_auction
(
    id                bigint generated always as identity primary key,
    work_id           bigint           not null,
    seller_id         bigint           not null,
    asking_price      int              not null,
    starting_price    int              not null,
    estimate_low      int              null,
    estimate_high     int              null,
    bid_increment     int              not null default 10000,
    current_price     int              null,
    bid_count         int              not null default 0,
    fee_rate          double precision not null default 0.10,
    fee_amount        int              not null,
    settlement_amount int              not null,
    deadline_hours    int              not null,
    started_at        timestamp        not null default now(),
    closing_at        timestamp        not null,
    cancel_threshold  double precision not null default 0.70,
    status            varchar(255)     not null default 'ACTIVE',
    winner_id         bigint           null,
    final_price       int              null,
    created_datetime  timestamp        not null default now(),
    updated_datetime  timestamp        not null default now(),

    constraint fk_auction_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_auction_seller foreign key (seller_id)
        references tbl_member (id),
    constraint fk_auction_winner foreign key (winner_id)
        references tbl_member (id),
    constraint chk_auction_price check (starting_price <= asking_price),
    constraint chk_auction_deadline check (deadline_hours > 0),
    constraint chk_auction_cancel_threshold check (cancel_threshold > 0 and cancel_threshold <= 1)
);

comment on table tbl_auction is '경매';
comment on column tbl_auction.id is '경매 번호 (PK)';
comment on column tbl_auction.work_id is '작품 FK';
comment on column tbl_auction.seller_id is '판매자(등록자) FK';
comment on column tbl_auction.asking_price is '판매 희망가';
comment on column tbl_auction.starting_price is '시작가';
comment on column tbl_auction.estimate_low is '추정가 하한';
comment on column tbl_auction.estimate_high is '추정가 상한';
comment on column tbl_auction.bid_increment is '호가 단위';
comment on column tbl_auction.current_price is '현재 최고가';
comment on column tbl_auction.bid_count is '입찰 횟수 (비정규화)';
comment on column tbl_auction.fee_rate is '수수료율 (10%)';
comment on column tbl_auction.fee_amount is '예상 수수료 금액 (희망가 기준)';
comment on column tbl_auction.settlement_amount is '정산 금액 (희망가 - 수수료)';
comment on column tbl_auction.deadline_hours is '마감기한 (시간 단위)';
comment on column tbl_auction.started_at is '경매 시작 시각';
comment on column tbl_auction.closing_at is '경매 마감 시각';
comment on column tbl_auction.cancel_threshold is '취소 불가 기준 (70%)';
comment on column tbl_auction.status is '상태 (ACTIVE/CLOSED/SOLD/CANCELLED)';
comment on column tbl_auction.winner_id is '낙찰자 FK';
comment on column tbl_auction.final_price is '낙찰가';

create index idx_auction_work on tbl_auction (work_id);
create index idx_auction_seller on tbl_auction (seller_id);
create index idx_auction_status on tbl_auction (status, closing_at);
create index idx_auction_closing on tbl_auction (closing_at);
