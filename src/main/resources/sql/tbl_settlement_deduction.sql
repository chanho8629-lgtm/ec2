-- ----------------------------------------------------------
-- 41. 정산 공제 항목 (tbl_settlement_deduction)
-- ----------------------------------------------------------
drop table if exists tbl_settlement_deduction cascade;

create table tbl_settlement_deduction (
    id             bigint generated always as identity primary key,
    settlement_id  bigint        not null,
    deduction_name varchar(255)  not null,
    amount         int not null,
    sort_order     int       not null default 0,

    constraint fk_sd_settlement foreign key (settlement_id)
        references tbl_settlement (id)
);

comment on table  tbl_settlement_deduction                is '정산 공제 항목';
comment on column tbl_settlement_deduction.id             is 'PK';
comment on column tbl_settlement_deduction.settlement_id  is '정산 FK';
comment on column tbl_settlement_deduction.deduction_name is '공제 항목명';
comment on column tbl_settlement_deduction.amount         is '공제 금액';

create index idx_sd_settlement on tbl_settlement_deduction (settlement_id);
