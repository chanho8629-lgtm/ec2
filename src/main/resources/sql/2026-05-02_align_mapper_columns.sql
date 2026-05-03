-- ----------------------------------------------------------
-- 매퍼와 DDL 정합성 마이그레이션 (2026-05-02)
-- 매퍼에서 사용 중이지만 기존 DDL에 없던 컬럼 추가
-- ----------------------------------------------------------

-- 1. tbl_member.banner_image (MemberMapper INSERT/UPDATE)
alter table tbl_member
    add column if not exists banner_image varchar(255) null;
comment on column tbl_member.banner_image is '프로필 배너 이미지 URL';

-- 2. tbl_work.thumbnail (OrderMapper SELECT)
alter table tbl_work
    add column if not exists thumbnail varchar(500) null;
comment on column tbl_work.thumbnail is '썸네일 이미지 URL';

-- 3. tbl_report.resolved_memo (AdminReportMapper SELECT/UPDATE)
alter table tbl_report
    add column if not exists resolved_memo varchar(500) null;
comment on column tbl_report.resolved_memo is '관리자 처리 메모';

-- 4. tbl_withdrawal_request 은행 정보 3종 (AdminWithdrawalMapper SELECT)
alter table tbl_withdrawal_request
    add column if not exists bank_name      varchar(255) null,
    add column if not exists account_number varchar(255) null,
    add column if not exists account_holder varchar(255) null;
comment on column tbl_withdrawal_request.bank_name      is '은행명';
comment on column tbl_withdrawal_request.account_number is '계좌번호';
comment on column tbl_withdrawal_request.account_holder is '예금주명';
