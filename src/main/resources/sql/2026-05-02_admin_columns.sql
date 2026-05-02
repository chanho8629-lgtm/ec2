-- ----------------------------------------------------------
-- 어드민 화면이 직접 사용할 수 있도록 컬럼 보강 (2026-05-02)
-- 기존에 SQL 표현식으로 임시 계산하던 값들을 실제 컬럼으로 승격
-- ----------------------------------------------------------

-- 1) tbl_member: 인증 상태 + 최종 활동 시각
alter table tbl_member
    add column if not exists email_verified         boolean   not null default false,
    add column if not exists phone_verified         boolean   not null default false,
    add column if not exists last_activity_datetime timestamp null;
comment on column tbl_member.email_verified         is '이메일 인증 여부';
comment on column tbl_member.phone_verified         is '휴대폰 인증 여부';
comment on column tbl_member.last_activity_datetime is '최종 활동 시각 (페이지 진입/요청 시 갱신)';

-- 2) tbl_withdrawal_request: 계좌 인증 상태
alter table tbl_withdrawal_request
    add column if not exists account_verified boolean not null default false;
comment on column tbl_withdrawal_request.account_verified is '계좌 인증 완료 여부';

-- ----------------------------------------------------------
-- 기존 회원에 대한 합리적 기본값 적용
-- ----------------------------------------------------------

-- 이미 phone_number 가 있다면 휴대폰 인증된 회원으로 간주
update tbl_member
   set phone_verified = true
 where phone_number is not null
   and phone_number <> ''
   and phone_verified = false;

-- 이메일 가입자는 이메일 인증 완료로 간주 (소셜만 가입은 false 유지)
update tbl_member
   set email_verified = true
 where email is not null
   and email_verified = false
   and exists (select 1 from tbl_member m2 where m2.id = tbl_member.id);

-- 계좌 정보가 모두 채워져 있다면 인증 처리
update tbl_withdrawal_request
   set account_verified = true
 where bank_name      is not null
   and account_number is not null
   and account_holder is not null
   and account_verified = false;
