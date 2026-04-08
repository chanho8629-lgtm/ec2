-- ==========================================================
-- 0407_yc_bideo.sql
-- admin 페이지 서버 작업을 위한 DB 변경사항
-- 날짜: 2026-04-07
-- ==========================================================

-- ----------------------------------------------------------
-- 1. tbl_report: 처리 메모 컬럼 추가
-- ----------------------------------------------------------
alter table tbl_report
    add column if not exists resolved_memo text;

comment on column tbl_report.resolved_memo is '신고 처리 메모';

-- ----------------------------------------------------------
-- 2. tbl_withdrawal_request: 은행 계좌 정보 컬럼 추가
-- ----------------------------------------------------------
alter table tbl_withdrawal_request
    add column if not exists bank_name varchar(50);

alter table tbl_withdrawal_request
    add column if not exists account_number varchar(50);

alter table tbl_withdrawal_request
    add column if not exists account_holder varchar(50);

comment on column tbl_withdrawal_request.bank_name       is '은행명';
comment on column tbl_withdrawal_request.account_number  is '계좌번호';
comment on column tbl_withdrawal_request.account_holder  is '예금주';


select * from tbl_member;