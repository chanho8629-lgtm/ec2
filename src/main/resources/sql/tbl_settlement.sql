-- ----------------------------------------------------------
-- 40. 정산 (tbl_settlement)
-- ----------------------------------------------------------
drop table if exists tbl_settlement cascade;

create table tbl_settlement (
    id                 bigint generated always as identity primary key,
    payment_id         bigint        not null,
    member_id          bigint        not null,
    pre_tax_amount     int not null,
    total_deduction    int not null,
    net_amount         int not null,
    effective_tax_rate int  not null,
    status             varchar(255)   not null default 'PENDING',
    approved_at        timestamp     null,
    paid_at            timestamp     null,
    created_datetime         timestamp     not null default now(),
    updated_datetime         timestamp     not null default now(),

    constraint fk_settlement_payment foreign key (payment_id)
        references tbl_payment (id),
    constraint fk_settlement_member foreign key (member_id)
        references tbl_member (id)
);

comment on table  tbl_settlement                    is '정산';
comment on column tbl_settlement.id                 is 'PK';
comment on column tbl_settlement.payment_id         is '결제 FK';
comment on column tbl_settlement.member_id          is '수령인(판매자) FK';
comment on column tbl_settlement.pre_tax_amount     is '세전 정산금';
comment on column tbl_settlement.total_deduction    is '공제 합계';
comment on column tbl_settlement.net_amount         is '실수령 정산금';
comment on column tbl_settlement.effective_tax_rate is '실효세율 (%)';
comment on column tbl_settlement.status             is '상태 (PENDING/APPROVED/PAID/REJECTED)';
comment on column tbl_settlement.approved_at        is '승인 일시';
comment on column tbl_settlement.paid_at            is '지급 일시';

create index idx_settlement_payment on tbl_settlement (payment_id);
create index idx_settlement_member  on tbl_settlement (member_id);
create index idx_settlement_status  on tbl_settlement (status, created_datetime desc);

