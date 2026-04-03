-- ----------------------------------------------------------
-- 44. 출금 요청 (tbl_withdrawal_request)
-- ----------------------------------------------------------
drop table if exists tbl_withdrawal_request cascade;

create table tbl_withdrawal_request (
    id                 bigint generated always as identity primary key,
    withdrawal_code    varchar(255)    not null,
    member_id          bigint          not null,
    settlement_id      bigint          null,
    requested_amount   int             not null,
    fee                int             not null default 0,
    net_amount         int             not null,
    status             varchar(255)    not null default 'PENDING',
    admin_id           bigint          null,
    rejected_reason    varchar(255)    null,
    requested_at       timestamp       not null default now(),
    approved_at        timestamp       null,
    paid_at            timestamp       null,
    created_datetime   timestamp       not null default now(),
    updated_datetime   timestamp       not null default now(),

    constraint uk_wr_code unique (withdrawal_code),
    constraint fk_wr_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_wr_settlement foreign key (settlement_id)
        references tbl_settlement (id),
    constraint fk_wr_admin foreign key (admin_id)
        references tbl_member (id),
    constraint chk_wr_status check (status in ('PENDING', 'APPROVED', 'REJECTED', 'PAID'))
);

comment on table  tbl_withdrawal_request                    is '출금 요청';
comment on column tbl_withdrawal_request.id                 is 'PK';
comment on column tbl_withdrawal_request.withdrawal_code    is '출금 요청 코드 (WDL-xxx)';
comment on column tbl_withdrawal_request.member_id          is '요청 회원 FK';
comment on column tbl_withdrawal_request.settlement_id      is '연관 정산 FK';
comment on column tbl_withdrawal_request.requested_amount   is '신청 금액';
comment on column tbl_withdrawal_request.fee                is '수수료';
comment on column tbl_withdrawal_request.net_amount         is '실수령액';
comment on column tbl_withdrawal_request.status             is '상태 (PENDING/APPROVED/REJECTED/PAID)';
comment on column tbl_withdrawal_request.admin_id           is '처리 관리자 FK';
comment on column tbl_withdrawal_request.rejected_reason    is '반려 사유';
comment on column tbl_withdrawal_request.requested_at       is '출금 요청 일시';
comment on column tbl_withdrawal_request.approved_at        is '승인 일시';
comment on column tbl_withdrawal_request.paid_at            is '지급 일시';

create index idx_wr_member on tbl_withdrawal_request (member_id);
create index idx_wr_status on tbl_withdrawal_request (status, requested_at desc);
create index idx_wr_settlement on tbl_withdrawal_request (settlement_id);
