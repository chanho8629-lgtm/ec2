-- ----------------------------------------------------------
-- 39. 주문 (tbl_order)
-- ----------------------------------------------------------
drop table if exists tbl_order cascade;

create table tbl_order (
    id               bigint generated always as identity primary key,
    order_code       varchar(255)   not null,
    buyer_id         bigint         not null,
    seller_id        bigint         not null,
    work_id          bigint         not null,
    auction_id       bigint         null,
    order_type       varchar(255)   not null default 'DIRECT',
    license_type     varchar(255)   not null default 'PERSONAL',
    original_price   int            not null,
    discount_amount  int            not null default 0,
    fee_amount       int            not null default 0,
    total_price      int            not null,
    deposit_amount   int            not null default 0,
    deposit_status   varchar(255)   null,
    balance_due_at   timestamp      null,
    ordered_at       timestamp      not null default now(),
    paid_at          timestamp      null,
    completed_at     timestamp      null,
    refunded_at      timestamp      null,
    status           varchar(255)   not null default 'PENDING_PAYMENT',

    constraint uk_order_code unique (order_code),
    constraint fk_order_buyer foreign key (buyer_id)
        references tbl_member (id),
    constraint fk_order_seller foreign key (seller_id)
        references tbl_member (id),
    constraint fk_order_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_order_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint chk_order_self check (buyer_id <> seller_id)
);

comment on table tbl_order is '주문';
comment on column tbl_order.id is 'PK';
comment on column tbl_order.order_code is '주문 코드';
comment on column tbl_order.buyer_id is '구매자 FK';
comment on column tbl_order.seller_id is '판매자 FK';
comment on column tbl_order.work_id is '작품 FK';
comment on column tbl_order.auction_id is '경매 FK';
comment on column tbl_order.order_type is '주문 유형 (DIRECT / AUCTION)';
comment on column tbl_order.license_type is '구매 라이선스 유형';
comment on column tbl_order.original_price is '원가';
comment on column tbl_order.discount_amount is '할인 금액';
comment on column tbl_order.fee_amount is '수수료';
comment on column tbl_order.total_price is '총 결제 예정 금액';
comment on column tbl_order.deposit_amount is '보증금';
comment on column tbl_order.deposit_status is '보증금 상태 (HELD / REFUNDED / APPLIED)';
comment on column tbl_order.balance_due_at is '잔금 결제 기한';
comment on column tbl_order.ordered_at is '주문 생성 일시';
comment on column tbl_order.paid_at is '결제 완료 일시';
comment on column tbl_order.completed_at is '주문 완료 일시';
comment on column tbl_order.refunded_at is '환불 완료 일시';
comment on column tbl_order.status is '상태 (PENDING_PAYMENT / DEPOSIT_HELD / PAID / COMPLETED / CANCELLED / REFUNDED)';

create index idx_order_buyer on tbl_order (buyer_id, ordered_at desc);
create index idx_order_seller on tbl_order (seller_id, ordered_at desc);
create index idx_order_work on tbl_order (work_id);
create index idx_order_auction on tbl_order (auction_id);
create index idx_order_status on tbl_order (status, ordered_at desc);
