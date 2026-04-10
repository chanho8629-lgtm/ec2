-- ----------------------------------------------------------
-- 39. 결제 (tbl_payment)
-- ----------------------------------------------------------
drop table if exists tbl_payment cascade;

create table tbl_payment (
    id              bigint generated always as identity primary key,
    payment_code    varchar(255)   not null,
    order_code      varchar(255)   not null,
    buyer_id        bigint        not null,
    seller_id       bigint        not null,
    work_id         bigint        not null,
    auction_id      bigint        null,
    original_amount int not null,
    total_price     int not null,
    total_fee       int not null,
    payment_purpose varchar(255)   not null default 'PURCHASE',
    pay_method      varchar(255)   not null,
    card_id         bigint        null,
    -- 변경: 부트페이 서버 결제 영수증 추적용 컬럼 추가
    pg_receipt_id   varchar(255)  null,
    status          varchar(255)   not null default 'PENDING',
    paid_at         timestamp     not null default now(),
    refunded_at     timestamp     null,
    created_datetime      timestamp     not null default now(),

    constraint uk_payment_code unique (payment_code),
    constraint fk_payment_order_code foreign key (order_code)
        references tbl_order (order_code),
    constraint fk_payment_buyer foreign key (buyer_id)
        references tbl_member (id),
    constraint fk_payment_seller foreign key (seller_id)
        references tbl_member (id),
    constraint fk_payment_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_payment_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_payment_card foreign key (card_id)
        references tbl_card (id),
    constraint chk_payment_self check (buyer_id <> seller_id)
);

comment on table  tbl_payment                 is '결제';
comment on column tbl_payment.id              is 'PK';
comment on column tbl_payment.payment_code    is '결제번호 (O-OR...)';
comment on column tbl_payment.order_code      is '주문번호 (B-SN...)';
comment on column tbl_payment.buyer_id        is '구매자 FK';
comment on column tbl_payment.seller_id       is '판매자 FK';
comment on column tbl_payment.work_id         is '작품 FK';
comment on column tbl_payment.auction_id      is '경매 FK (경매 거래인 경우)';
comment on column tbl_payment.original_amount is '최초 결제금액';
comment on column tbl_payment.total_price     is '총 구매가';
comment on column tbl_payment.total_fee       is '총 수수료';
comment on column tbl_payment.payment_purpose is '결제 목적 (PURCHASE / DEPOSIT / BALANCE)';
comment on column tbl_payment.pay_method      is '결제 수단 (KAKAO_PAY / CARD 등)';
comment on column tbl_payment.card_id         is '사용 카드 FK';
comment on column tbl_payment.pg_receipt_id   is 'PG/부트페이 영수증 ID';
comment on column tbl_payment.status          is '상태 (PENDING/AUTHORIZED/COMPLETED/REFUNDED/CANCELLED)';
comment on column tbl_payment.paid_at         is '거래 일시';

create index idx_payment_order_code on tbl_payment (order_code);
create index idx_payment_buyer   on tbl_payment (buyer_id);
create index idx_payment_seller  on tbl_payment (seller_id);
create index idx_payment_work    on tbl_payment (work_id);
create index idx_payment_auction on tbl_payment (auction_id);
