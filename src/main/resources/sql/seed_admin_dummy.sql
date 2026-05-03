-- =================================================================
-- 어드민 QA 더미 데이터 (각 목록 100건)
-- 갱신일: 2026-05-02
-- 사전 조건: create_all_tables.sql + 2026-05-02_admin_columns.sql 적용
-- 실행: psql -U bideo -d bideo -f seed_admin_dummy.sql
--
-- 로그인:
--   email   : admin@bideo.com
--   password: admin1234
-- =================================================================

\echo '=> Truncating member-dependent tables (cascade)'
truncate tbl_member restart identity cascade;

-- ---------------------------------------------------------------
-- 1) 관리자 (id = 1)
-- ---------------------------------------------------------------
\echo '=> Inserting admin'
insert into tbl_member (
    email, password, nickname, real_name, role, status,
    creator_verified, creator_tier, phone_number,
    email_verified, phone_verified,
    last_login_datetime, last_activity_datetime
) values (
    'admin@bideo.com',
    '$2b$10$J34V9sWoEokz6k6NhZtAxe2QYEGXHsZ4L/N.RaJDmHnQlZZXGdUO6',
    '관리자', '관리자', 'ADMIN', 'ACTIVE',
    false, 'BASIC', '010-0000-0000',
    true, true,
    now() - interval '5 minute', now()
);

-- ---------------------------------------------------------------
-- 2) 회원 100명 (id 2~101): 작가 50 + 컬렉터 50
-- ---------------------------------------------------------------
\echo '=> Inserting 100 members'
insert into tbl_member (
    email, password, nickname, real_name, role, status,
    creator_verified, creator_tier, phone_number,
    follower_count, following_count, gallery_count,
    email_verified, phone_verified,
    last_login_datetime, last_activity_datetime,
    created_datetime
)
select
    'qa' || lpad(i::text, 3, '0') || '@bideo.com',
    '$2b$10$J34V9sWoEokz6k6NhZtAxe2QYEGXHsZ4L/N.RaJDmHnQlZZXGdUO6',
    case when i <= 50 then 'QA작가' || lpad(i::text, 3, '0')
         else                  'QA컬렉터' || lpad((i - 50)::text, 3, '0') end,
    case when i <= 50 then '작가' || lpad(i::text, 3, '0')
         else                  '컬렉터' || lpad((i - 50)::text, 3, '0') end,
    'USER',
    case
        when i % 17 = 0 then 'BANNED'
        when i % 11 = 0 then 'SUSPENDED'
        else 'ACTIVE'
    end,
    i <= 50,
    case when i % 3 = 0 then 'PREMIUM' else 'BASIC' end,
    '010-' || lpad((1000 + i)::text, 4, '0') || '-' || lpad((1000 + i*2)::text, 4, '0'),
    case when i <= 50 then (i * 7) % 200 else (i * 2) % 50 end,
    case when i <= 50 then (i * 3) % 30  else (i * 5) % 100 end,
    case when i <= 50 then (i % 6)       else 0 end,
    true,
    case when i % 7 = 0 then false else true end,
    now() - ((i % 240 + 1) || ' hour')::interval,
    now() - ((i % 60 + 1)  || ' minute')::interval,
    now() - ((i % 365 + 1) || ' day')::interval
from generate_series(1, 100) as g(i);

-- ---------------------------------------------------------------
-- 3) OAuth 연동 (일부 컬렉터)
-- ---------------------------------------------------------------
\echo '=> Inserting OAuth links'
insert into tbl_oauth (member_id, provider, provider_id)
select 51 + i,
       (case (i % 3) when 0 then 'google' when 1 then 'kakao' else 'naver' end)::oauth_provider,
       'oauth-qa-' || lpad(i::text, 3, '0')
from generate_series(1, 30) as g(i);

-- ---------------------------------------------------------------
-- 4) 작품 100개 (작가 50명이 2개씩)
-- ---------------------------------------------------------------
\echo '=> Inserting 100 works'
insert into tbl_work (
    member_id, title, category, description, price, license_type,
    is_tradable, thumbnail, view_count, like_count, save_count, status,
    created_datetime
)
select
    ((i - 1) % 50) + 2,
    'QA-작품-' || lpad(i::text, 3, '0'),
    case (i % 7)
        when 0 then 'DIGITAL_ART'
        when 1 then 'MOTION'
        when 2 then '3D_ANIMATION'
        when 3 then 'CINEMATIC'
        when 4 then 'EXPERIMENTAL'
        when 5 then 'LOOP'
        else        'AI_GENERATED'
    end,
    'QA 더미 작품 #' || i,
    50000 + (i * 1000),
    case (i % 3) when 0 then 'PERSONAL' when 1 then 'COMMERCIAL' else 'EXCLUSIVE' end,
    true,
    'https://placehold.co/640x360/0a0a0a/065fd4?text=QA-Work-' || i,
    (i * 17) % 5000,
    (i * 7)  % 500,
    (i * 3)  % 200,
    case when i % 23 = 0 then 'HIDDEN' else 'ACTIVE' end,
    now() - ((i % 365 + 1) || ' hour')::interval
from generate_series(1, 100) as g(i);

-- ---------------------------------------------------------------
-- 5) 작품 파일 (각 작품 = 썸네일 1 + 비디오 1)
-- ---------------------------------------------------------------
\echo '=> Inserting work files (200 rows)'
insert into tbl_work_file (work_id, file_url, file_type, file_size, width, height, sort_order)
select i, 'https://placehold.co/640x360/0a0a0a/065fd4?text=QA-Work-' || i,
       'THUMBNAIL', 102400, 640, 360, 0
from generate_series(1, 100) as g(i);

insert into tbl_work_file (work_id, file_url, file_type, file_size, width, height, sort_order)
select i,
       case when i % 2 = 0 then 'https://www.w3schools.com/html/movie.mp4'
                          else 'https://www.w3schools.com/html/mov_bbb.mp4' end,
       'VIDEO', 1048576 + (i * 1000), 1920, 1080, 1
from generate_series(1, 100) as g(i);

-- ---------------------------------------------------------------
-- 6) 카드 (컬렉터 50명, 각 1장)
-- ---------------------------------------------------------------
\echo '=> Inserting 50 cards'
insert into tbl_card (member_id, card_company, card_number_masked, billing_method, billing_status, is_default)
select 51 + i,
       case (i % 4) when 0 then '신한카드' when 1 then '국민카드' when 2 then '삼성카드' else '현대카드' end,
       '****-****-****-' || lpad(((i * 13) % 9000 + 1000)::text, 4, '0'),
       'CARD', 'ACTIVE', true
from generate_series(1, 50) as g(i);

-- ---------------------------------------------------------------
-- 7) 경매 100건 (모두 종료 상태: SOLD 50 + CLOSED 50)
-- ---------------------------------------------------------------
\echo '=> Inserting 100 auctions (FINISHED only)'
insert into tbl_auction (
    work_id, seller_id, asking_price, starting_price, bid_increment,
    current_price, bid_count, fee_rate, fee_amount, settlement_amount,
    deadline_hours, started_at, closing_at, status,
    winner_id, final_price
)
select
    i,
    ((i - 1) % 50) + 2,
    (i * 5000) + 500000,
    (i * 3000) + 200000,
    10000,
    case when i % 2 = 0 then ((i * 4500) + 250000) else null end,
    case when i % 2 = 0 then 5 + (i % 8) else 0 end,
    0.10,
    case when i % 2 = 0 then ((i * 450) + 25000) else 0 end,
    case when i % 2 = 0 then ((i * 4050) + 225000) else 0 end,
    72,
    now() - ((i % 30 + 5) || ' day')::interval,
    now() - ((i % 5 + 1)  || ' day')::interval,
    case when i % 2 = 0 then 'SOLD' else 'CLOSED' end,
    case when i % 2 = 0 then 52 + ((i + 7) % 50) else null end,
    case when i % 2 = 0 then ((i * 4500) + 250000) else null end
from generate_series(1, 100) as g(i);

-- ---------------------------------------------------------------
-- 8) 입찰 (SOLD 경매에 대해 낙찰 + 이전 입찰 1~2건)
-- ---------------------------------------------------------------
\echo '=> Inserting bids'
insert into tbl_bid (auction_id, member_id, bid_price, is_winning)
select a.id, a.winner_id, a.final_price, true
  from tbl_auction a
 where a.status = 'SOLD';

insert into tbl_bid (auction_id, member_id, bid_price, is_winning)
select a.id,
       52 + ((a.id + 13) % 50),
       a.starting_price + a.bid_increment * 2,
       false
  from tbl_auction a
 where a.status = 'SOLD'
   and a.id % 3 <> 0;

-- ---------------------------------------------------------------
-- 9) 주문 100건
-- ---------------------------------------------------------------
\echo '=> Inserting 100 orders'
insert into tbl_order (
    order_code, buyer_id, seller_id, work_id, auction_id,
    order_type, license_type,
    original_price, fee_amount, total_price,
    ordered_at, paid_at, completed_at, refunded_at, status
)
select
    'ORD-QA-' || lpad(i::text, 4, '0'),
    52 + (((i - 1) + 7) % 50),
    ((i - 1) % 50) + 2,
    ((i - 1) % 100) + 1,
    case when i % 2 = 0 then ((i - 1) % 100) + 1 else null end,
    case when i % 2 = 0 then 'AUCTION' else 'DIRECT' end,
    case (i % 3) when 0 then 'PERSONAL' when 1 then 'COMMERCIAL' else 'EXCLUSIVE' end,
    100000 + (i * 5000),
    (100000 + (i * 5000)) / 10,
    100000 + (i * 5000),
    now() - ((i + 2) || ' day')::interval,
    case when i % 5 <> 0 then now() - ((i + 1) || ' day')::interval else null end,
    case when i % 5 in (1, 2, 3) then now() - (i || ' day')::interval else null end,
    case when i % 5 = 4 then now() - (i || ' day')::interval else null end,
    case (i % 5)
        when 0 then 'PENDING_PAYMENT'
        when 1 then 'COMPLETED'
        when 2 then 'COMPLETED'
        when 3 then 'COMPLETED'
        else        'CANCELLED'
    end
from generate_series(1, 100) as g(i);

-- ---------------------------------------------------------------
-- 10) 결제 100건
-- ---------------------------------------------------------------
\echo '=> Inserting 100 payments'
insert into tbl_payment (
    payment_code, order_code, buyer_id, seller_id, work_id, auction_id,
    original_amount, total_price, total_fee,
    pay_method, card_id, status, paid_at, refunded_at
)
select
    'PAY-QA-' || lpad(i::text, 4, '0'),
    'ORD-QA-' || lpad(i::text, 4, '0'),
    52 + (((i - 1) + 7) % 50),
    ((i - 1) % 50) + 2,
    ((i - 1) % 100) + 1,
    case when i % 2 = 0 then ((i - 1) % 100) + 1 else null end,
    100000 + (i * 5000),
    100000 + (i * 5000),
    (100000 + (i * 5000)) / 10,
    'CARD',
    (((i - 1) + 7) % 50) + 1,
    case (i % 5)
        when 0 then 'PENDING'
        when 1 then 'COMPLETED'
        when 2 then 'AUTHORIZED'
        when 3 then 'COMPLETED'
        else        'CANCELLED'
    end,
    now() - ((i + 1) || ' day')::interval,
    case when i % 5 = 4 then now() - (i || ' day')::interval else null end
from generate_series(1, 100) as g(i);

-- 환불은 별도 패스로 일부 갱신
update tbl_payment
   set status = 'REFUNDED',
       refunded_at = now() - interval '6 hour'
 where payment_code in ('PAY-QA-0010', 'PAY-QA-0030', 'PAY-QA-0050', 'PAY-QA-0070', 'PAY-QA-0090');

-- ---------------------------------------------------------------
-- 11) 정산 (COMPLETED 결제 대상)
-- ---------------------------------------------------------------
\echo '=> Inserting settlements for COMPLETED payments'
insert into tbl_settlement (
    payment_id, member_id,
    pre_tax_amount, total_deduction, net_amount,
    effective_tax_rate, status, approved_at, paid_at
)
select
    p.id, p.seller_id,
    p.total_price, p.total_fee, p.total_price - p.total_fee,
    10,
    case when p.id % 3 = 0 then 'PAID' else 'PENDING' end,
    case when p.id % 3 = 0 then now() - interval '12 hour' else null end,
    case when p.id % 3 = 0 then now() - interval '6 hour'  else null end
  from tbl_payment p
 where p.status = 'COMPLETED';

-- ---------------------------------------------------------------
-- 12) 출금 요청 100건
-- ---------------------------------------------------------------
\echo '=> Inserting 100 withdrawal requests'
insert into tbl_withdrawal_request (
    withdrawal_code, member_id,
    requested_amount, fee, net_amount,
    bank_name, account_number, account_holder, account_verified,
    status, requested_at, approved_at, admin_id, rejected_reason
)
select
    'WDL-QA-' || lpad(i::text, 4, '0'),
    ((i - 1) % 50) + 2,
    100000 + (i * 5000),
    (100000 + (i * 5000)) * 33 / 1000,
    (100000 + (i * 5000)) - (100000 + (i * 5000)) * 33 / 1000,
    case (i % 4) when 0 then '신한은행' when 1 then '국민은행' when 2 then '카카오뱅크' else '우리은행' end,
    lpad((i * 13)::text, 3, '0') || '-' || lpad((i * 17)::text, 6, '0') || '-' || lpad((i * 23)::text, 4, '0'),
    'Holder-' || lpad(i::text, 3, '0'),
    case when i % 5 <> 0 then true else false end,
    case (i % 4)
        when 0 then 'PENDING'
        when 1 then 'APPROVED'
        when 2 then 'PAID'
        else        'REJECTED'
    end,
    now() - ((i + 1) || ' hour')::interval,
    case when i % 4 in (1, 2) then now() - (i || ' hour')::interval else null end,
    case when i % 4 in (1, 2) then 1 else null end,
    case when i % 4 = 3 then '계좌 정보 불일치 (QA)' else null end
from generate_series(1, 100) as g(i);

-- ---------------------------------------------------------------
-- 13) 신고 100건 (다양한 target_type / status)
-- ---------------------------------------------------------------
\echo '=> Inserting 100 reports'
insert into tbl_report (
    reporter_id, target_type, target_id,
    reason, detail, status,
    resolved_at, resolved_memo, created_datetime
)
select
    52 + ((i + 5) % 50),
    case (i % 4) when 0 then 'WORK' when 1 then 'MEMBER' when 2 then 'WORK' else 'MEMBER' end,
    case (i % 4)
        when 0 then ((i - 1) % 100) + 1
        when 1 then ((i - 1) % 50)  + 2
        when 2 then ((i - 1) % 100) + 1
        else        2 + ((i + 11) % 50)
    end,
    case (i % 4)
        when 0 then 'SENSITIVE'
        when 1 then 'IMPERSONATION'
        when 2 then 'COPYRIGHT'
        else        'HARASSMENT'
    end,
    'QA 더미 신고 사유 #' || i,
    case (i % 4)
        when 0 then 'PENDING'
        when 1 then 'REVIEWING'
        when 2 then 'RESOLVED'
        else        'CANCELLED'
    end,
    case when i % 4 = 2 then now() - ((i / 2 + 1) || ' day')::interval else null end,
    case when i % 4 = 2 then 'QA 처리 완료 메모 #' || i else null end,
    now() - ((i + 1) || ' hour')::interval
from generate_series(1, 100) as g(i);

-- ---------------------------------------------------------------
-- 14) 회원 제재 (SUSPENDED/BANNED 회원에게)
-- ---------------------------------------------------------------
\echo '=> Inserting member restrictions'
insert into tbl_member_restriction (member_id, restriction_type, reason, status, previous_member_status, end_datetime)
select m.id,
       case when m.status = 'BANNED' then 'BLOCK' else 'LIMIT' end,
       'QA 자동 제재',
       'ACTIVE',
       'ACTIVE',
       case when m.status = 'BANNED' then null else now() + interval '7 day' end
  from tbl_member m
 where m.status in ('SUSPENDED', 'BANNED');

-- ---------------------------------------------------------------
-- 15) 문의 (확인용 10건)
-- ---------------------------------------------------------------
\echo '=> Inserting inquiries'
insert into tbl_inquiry (member_id, category, content, reply, status, created_datetime, updated_datetime)
select 52 + (i % 50),
       case (i % 3) when 0 then 'PAYMENT' when 1 then 'ACCOUNT' else 'WITHDRAWAL' end,
       'QA 문의 본문 #' || i,
       case when i % 2 = 0 then 'QA 답변 #' || i else null end,
       case when i % 2 = 0 then 'ANSWERED' else 'PENDING' end,
       now() - (i || ' day')::interval,
       now() - ((i / 2 + 1) || ' day')::interval
  from generate_series(1, 10) as g(i);

\echo '=> Final row counts:'
select 'members'      as t, count(*) from tbl_member
 union all select 'works',       count(*) from tbl_work
 union all select 'auctions',    count(*) from tbl_auction
 union all select 'payments',    count(*) from tbl_payment
 union all select 'orders',      count(*) from tbl_order
 union all select 'reports',     count(*) from tbl_report
 union all select 'withdrawals', count(*) from tbl_withdrawal_request
 union all select 'work_files',  count(*) from tbl_work_file
 union all select 'cards',       count(*) from tbl_card
 union all select 'bids',        count(*) from tbl_bid
 union all select 'settlements', count(*) from tbl_settlement
 union all select 'restrictions',count(*) from tbl_member_restriction
 union all select 'inquiries',   count(*) from tbl_inquiry;
