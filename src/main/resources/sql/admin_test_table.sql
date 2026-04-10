-- ==========================================================
-- admin_test_table.sql
-- admin 페이지 테스트용 더미 데이터
-- 날짜: 2026-04-07
-- 실행 전 0407_yc_bideo.sql 먼저 실행할 것
-- ==========================================================

-- ----------------------------------------------------------
-- 기존 테스트 데이터 정리
-- ----------------------------------------------------------
delete from tbl_member_restriction;
delete from tbl_withdrawal_request;
delete from tbl_settlement;
delete from tbl_payment;
delete from tbl_order;
delete from tbl_bid;
delete from tbl_auction;
delete from tbl_comment;
delete from tbl_work_file;
delete from tbl_work_view;
delete from tbl_bookmark;
delete from tbl_follow;
delete from tbl_report;
delete from tbl_card;
delete from tbl_oauth;
delete from tbl_member;

-- 시퀀스 리셋
alter table tbl_member alter column id restart with 100;
alter table tbl_report alter column id restart with 100;
alter table tbl_work alter column id restart with 100;
alter table tbl_work_file alter column id restart with 100;
alter table tbl_auction alter column id restart with 100;
alter table tbl_bid alter column id restart with 100;
alter table tbl_order alter column id restart with 100;
alter table tbl_payment alter column id restart with 100;
alter table tbl_settlement alter column id restart with 100;
alter table tbl_withdrawal_request alter column id restart with 100;
alter table tbl_member_restriction alter column id restart with 100;
alter table tbl_follow alter column id restart with 100;
alter table tbl_card alter column id restart with 100;
alter table tbl_oauth alter column id restart with 100;
alter table tbl_comment alter column id restart with 100;
alter table tbl_bookmark alter column id restart with 100;

-- ==========================================================
-- 1. 회원 (tbl_member) - 8명 (admin 1명 + 일반 7명)
-- ==========================================================
insert into tbl_member (id, email, password, nickname, real_name, phone_number, role, creator_verified, seller_verified, creator_tier, follower_count, following_count, status, last_login_datetime, created_datetime)
overriding system value
values
    (1, 'admin@bideo.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', 'BIDEO Admin', '관리자', '010-0000-0000', 'ADMIN', false, false, 'BASIC', 0, 0, 'ACTIVE', now(), '2024-01-01'),
    (2, 'kimjh@naver.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '김지훈', '김지훈', '010-1111-2222', 'USER', true, true, 'PREMIUM', 89, 23, 'ACTIVE', '2026-03-30 14:00:00', '2024-03-15'),
    (3, 'parksy@gmail.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '박서연', '박서연', '010-2222-3333', 'USER', true, true, 'PREMIUM', 127, 45, 'ACTIVE', '2026-03-28 10:30:00', '2024-01-22'),
    (4, 'leemk@daum.net', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '이민규', '이민규', '010-3333-4444', 'USER', true, true, 'BASIC', 34, 12, 'SUSPENDED', '2026-03-25 08:00:00', '2024-05-10'),
    (5, 'choisj@naver.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '최수진', '최수진', '010-4444-5555', 'USER', false, false, 'BASIC', 56, 30, 'ACTIVE', '2026-03-29 16:00:00', '2024-06-03'),
    (6, 'jungwh@gmail.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '정우현', '정우현', '010-5555-6666', 'USER', false, false, 'BASIC', 41, 18, 'ACTIVE', '2026-03-27 22:00:00', '2024-07-18'),
    (7, 'kangha@hanmail.net', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '강하늘', '강하늘', '010-6666-7777', 'USER', true, true, 'BASIC', 22, 8, 'BANNED', '2026-03-20 12:00:00', '2024-02-28'),
    (8, 'yoones@naver.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '윤은서', '윤은서', '010-7777-8888', 'USER', false, false, 'BASIC', 67, 25, 'ACTIVE', '2026-03-30 09:00:00', '2024-08-05');

-- ==========================================================
-- 2. OAuth 소셜 로그인 (tbl_oauth)
-- ==========================================================
insert into tbl_oauth (member_id, provider, provider_id, connected_at)
values
    (2, 'kakao'::oauth_provider, 'kakao_kimjh_001', '2024-03-15'),
    (3, 'kakao'::oauth_provider, 'kakao_parksy_002', '2024-01-22'),
    (5, 'naver'::oauth_provider, 'naver_choisj_003', '2024-06-03'),
    (6, 'naver'::oauth_provider, 'naver_jungwh_004', '2024-07-18'),
    (8, 'kakao'::oauth_provider, 'kakao_yoones_005', '2024-08-05');

-- ==========================================================
-- 3. 카드 (tbl_card)
-- ==========================================================
insert into tbl_card (member_id, card_company, card_number_masked, billing_key, is_default)
values
    (2, '신한카드', '**** **** **** 1234', 'billing_key_001', true),
    (3, '국민카드', '**** **** **** 5678', 'billing_key_002', true),
    (5, '하나카드', '**** **** **** 9012', 'billing_key_003', true),
    (6, '우리카드', '**** **** **** 3456', 'billing_key_004', true),
    (8, '국민카드', '**** **** **** 7890', 'billing_key_005', true);

-- ==========================================================
-- 4. 작품 (tbl_work) - 7개
-- ==========================================================
insert into tbl_work (member_id, title, category, description, price, license_type, is_tradable, allow_comment, show_similar, view_count, like_count, save_count, comment_count, status, created_datetime)
values
    (3, '새벽의 여정', '유화', '새벽빛이 물드는 바다 위의 작은 배를 담은 유화 작품', 500000, 'PERSONAL', false, true, true, 342, 45, 89, 12, 'ACTIVE', '2025-11-20'),
    (2, '도시의 빛', '사진', '서울 야경을 담은 도시 풍경 사진', 300000, 'PERSONAL', true, true, true, 218, 32, 56, 8, 'ACTIVE', '2025-12-05'),
    (4, '별이 빛나는 밤에 - 모작', '유화', '반 고흐의 별이 빛나는 밤에를 현대적으로 재해석', null, null, false, true, true, 89, 5, 12, 3, 'HIDDEN', '2026-01-10'),
    (5, '푸른 숲의 노래', '수채화', '제주도 곶자왈의 초록빛 숲을 수채화로 표현', 800000, 'COMMERCIAL', false, true, true, 156, 28, 44, 6, 'ACTIVE', '2026-01-22'),
    (6, '추상적 감정', '디지털아트', '디지털 도구로 표현한 인간의 복잡한 감정', 200000, 'PERSONAL', true, true, true, 431, 67, 98, 15, 'ACTIVE', '2026-02-14'),
    (7, '무제 #12', '조각', '금속과 나무를 결합한 현대 조각 작품', 150000, 'PERSONAL', true, true, true, 67, 8, 15, 2, 'HIDDEN', '2026-02-28'),
    (8, '한강의 저녁', '사진', '한강 선유도에서 촬영한 노을 사진', 400000, 'PERSONAL', false, true, true, 289, 41, 72, 9, 'ACTIVE', '2026-03-05');

-- ==========================================================
-- 5. 작품 파일 (tbl_work_file)
-- ==========================================================
insert into tbl_work_file (work_id, file_url, file_type, file_size, width, height, sort_order)
values
    (1, 'https://picsum.photos/seed/artwork1/1920/1080', 'THUMBNAIL', 5242880, 1920, 1080, 0),
    (1, 'https://picsum.photos/seed/artwork1_full/3840/2160', 'IMAGE', 15728640, 3840, 2160, 1),
    (2, 'https://picsum.photos/seed/artwork2/1920/1080', 'THUMBNAIL', 3145728, 1920, 1080, 0),
    (2, 'https://picsum.photos/seed/artwork2_full/3840/2160', 'IMAGE', 10485760, 3840, 2160, 1),
    (3, 'https://picsum.photos/seed/artwork3/1920/1080', 'THUMBNAIL', 4194304, 1920, 1080, 0),
    (4, 'https://picsum.photos/seed/artwork4/1920/1080', 'THUMBNAIL', 2097152, 1920, 1080, 0),
    (5, 'https://picsum.photos/seed/artwork5/1920/1080', 'THUMBNAIL', 6291456, 1920, 1080, 0),
    (6, 'https://picsum.photos/seed/artwork6/1920/1080', 'THUMBNAIL', 1048576, 1920, 1080, 0),
    (7, 'https://picsum.photos/seed/artwork7/1920/1080', 'THUMBNAIL', 4718592, 1920, 1080, 0);

-- ==========================================================
-- 6. 팔로우 (tbl_follow)
-- ==========================================================
insert into tbl_follow (follower_id, following_id)
values
    (2, 3), (2, 5), (3, 2), (3, 8), (5, 3),
    (5, 6), (6, 2), (6, 3), (8, 2), (8, 3),
    (8, 6), (5, 2), (6, 8);

-- ==========================================================
-- 7. 경매 (tbl_auction) - 5개
-- ==========================================================
insert into tbl_auction (work_id, seller_id, asking_price, starting_price, bid_increment, current_price, bid_count, fee_rate, fee_amount, settlement_amount, deadline_hours, started_at, closing_at, status, winner_id, final_price, created_datetime)
values
    (1, 3, 3000000, 500000, 10000, 2500000, 14, 0.15, 375000, 2125000, 48, '2026-03-18 10:00:00', '2026-03-20 18:00:00', 'SOLD', 3, 2500000, '2026-03-18'),
    (2, 2, 2000000, 300000, 10000, 1800000, 9, 0.15, 270000, 1530000, 48, '2026-03-16 12:00:00', '2026-03-18 20:00:00', 'SOLD', 5, 1800000, '2026-03-16'),
    (4, 5, 4000000, 800000, 10000, 3200000, 22, 0.15, 480000, 2720000, 48, '2026-03-13 09:00:00', '2026-03-15 21:00:00', 'SOLD', 2, 3200000, '2026-03-13'),
    (5, 6, 1000000, 200000, 10000, 950000, 6, 0.15, 142500, 807500, 48, '2026-03-10 14:00:00', '2026-03-12 19:00:00', 'SOLD', 8, 950000, '2026-03-10'),
    (7, 8, 2000000, 400000, 10000, 1450000, 11, 0.15, 217500, 1232500, 48, '2026-03-08 11:00:00', '2026-03-10 17:00:00', 'SOLD', 6, 1450000, '2026-03-08');

-- ==========================================================
-- 8. 입찰 (tbl_bid) - 경매별 주요 입찰 내역
-- ==========================================================
insert into tbl_bid (auction_id, member_id, bid_price, is_winning, created_datetime)
values
    -- AUC-001 (새벽의 여정) 낙찰자: 박서연(3)
    (1, 5, 600000, false, '2026-03-18 10:30:00'),
    (1, 6, 800000, false, '2026-03-18 12:00:00'),
    (1, 3, 1000000, false, '2026-03-18 15:00:00'),
    (1, 8, 1200000, false, '2026-03-19 09:00:00'),
    (1, 5, 1500000, false, '2026-03-19 11:00:00'),
    (1, 3, 1800000, false, '2026-03-19 14:00:00'),
    (1, 6, 2000000, false, '2026-03-19 16:00:00'),
    (1, 3, 2200000, false, '2026-03-20 08:00:00'),
    (1, 8, 2300000, false, '2026-03-20 10:00:00'),
    (1, 3, 2500000, true, '2026-03-20 14:00:00'),
    -- AUC-002 (도시의 빛) 낙찰자: 최수진(5)
    (2, 5, 400000, false, '2026-03-16 14:00:00'),
    (2, 6, 600000, false, '2026-03-16 18:00:00'),
    (2, 8, 900000, false, '2026-03-17 10:00:00'),
    (2, 5, 1200000, false, '2026-03-17 15:00:00'),
    (2, 6, 1500000, false, '2026-03-18 08:00:00'),
    (2, 5, 1800000, true, '2026-03-18 16:00:00'),
    -- AUC-003 (푸른 숲의 노래) 낙찰자: 김지훈(2)
    (3, 2, 1000000, false, '2026-03-13 10:00:00'),
    (3, 6, 1400000, false, '2026-03-13 14:00:00'),
    (3, 8, 1800000, false, '2026-03-13 18:00:00'),
    (3, 2, 2200000, false, '2026-03-14 09:00:00'),
    (3, 6, 2600000, false, '2026-03-14 14:00:00'),
    (3, 2, 3000000, false, '2026-03-15 10:00:00'),
    (3, 2, 3200000, true, '2026-03-15 18:00:00'),
    -- AUC-004 (추상적 감정) 낙찰자: 윤은서(8)
    (4, 8, 300000, false, '2026-03-10 15:00:00'),
    (4, 2, 500000, false, '2026-03-11 10:00:00'),
    (4, 8, 700000, false, '2026-03-11 16:00:00'),
    (4, 8, 950000, true, '2026-03-12 15:00:00'),
    -- AUC-005 (한강의 저녁) 낙찰자: 정우현(6)
    (5, 6, 500000, false, '2026-03-08 12:00:00'),
    (5, 2, 700000, false, '2026-03-08 16:00:00'),
    (5, 5, 900000, false, '2026-03-09 09:00:00'),
    (5, 6, 1100000, false, '2026-03-09 14:00:00'),
    (5, 2, 1300000, false, '2026-03-10 08:00:00'),
    (5, 6, 1450000, true, '2026-03-10 14:00:00');

-- ==========================================================
-- 9. 주문 (tbl_order) - 7건
-- ==========================================================
insert into tbl_order (order_code, buyer_id, seller_id, work_id, auction_id, order_type, license_type, original_price, discount_amount, fee_amount, total_price, ordered_at, paid_at, completed_at, status)
values
    ('ORD-001', 3, 2, 1, 1, 'AUCTION', 'PERSONAL', 2500000, 0, 250000, 2500000, '2026-03-20 14:30:00', '2026-03-20 14:32:00', '2026-03-20 14:32:00', 'COMPLETED'),
    ('ORD-002', 5, 3, 2, 2, 'AUCTION', 'PERSONAL', 1800000, 0, 180000, 1800000, '2026-03-18 16:30:00', '2026-03-18 16:35:00', '2026-03-18 16:35:00', 'COMPLETED'),
    ('ORD-003', 4, 6, 5, null, 'DIRECT', 'COMMERCIAL', 750000, 0, 75000, 750000, '2026-03-15 10:00:00', null, null, 'CANCELLED'),
    ('ORD-004', 2, 5, 4, 3, 'AUCTION', 'PERSONAL', 3200000, 0, 320000, 3200000, '2026-03-15 18:30:00', '2026-03-15 18:40:00', '2026-03-15 18:40:00', 'COMPLETED'),
    ('ORD-005', 8, 2, 2, null, 'DIRECT', 'PERSONAL', 1200000, 0, 120000, 1200000, '2026-03-12 11:00:00', '2026-03-12 11:05:00', '2026-03-12 11:05:00', 'COMPLETED'),
    ('ORD-006', 7, 4, 3, null, 'DIRECT', 'PERSONAL', 680000, 0, 68000, 680000, '2026-03-10 09:00:00', null, null, 'CANCELLED'),
    ('ORD-007', 6, 8, 7, 5, 'AUCTION', 'PERSONAL', 1450000, 0, 145000, 1450000, '2026-03-10 14:30:00', '2026-03-10 14:35:00', '2026-03-10 14:35:00', 'COMPLETED');

-- ==========================================================
-- 10. 결제 (tbl_payment) - 7건
-- ==========================================================
insert into tbl_payment (payment_code, order_code, buyer_id, seller_id, work_id, auction_id, original_amount, total_price, total_fee, payment_purpose, pay_method, card_id, status, paid_at)
values
    ('PAY-001', 'ORD-001', 3, 2, 1, 1, 2500000, 2500000, 250000, 'PURCHASE', 'CARD', 2, 'COMPLETED', '2026-03-20 14:32:00'),
    ('PAY-002', 'ORD-002', 5, 3, 2, 2, 1800000, 1800000, 180000, 'PURCHASE', 'CARD', 3, 'COMPLETED', '2026-03-18 16:35:00'),
    ('PAY-003', 'ORD-003', 4, 6, 5, null, 750000, 750000, 75000, 'PURCHASE', 'CARD', null, 'CANCELLED', '2026-03-15 10:05:00'),
    ('PAY-004', 'ORD-004', 2, 5, 4, 3, 3200000, 3200000, 320000, 'PURCHASE', 'CARD', 1, 'COMPLETED', '2026-03-15 18:40:00'),
    ('PAY-005', 'ORD-005', 8, 2, 2, null, 1200000, 1200000, 120000, 'PURCHASE', 'KAKAO_PAY', null, 'COMPLETED', '2026-03-12 11:05:00'),
    ('PAY-006', 'ORD-006', 7, 4, 3, null, 680000, 680000, 68000, 'PURCHASE', 'CARD', null, 'CANCELLED', '2026-03-10 09:05:00'),
    ('PAY-007', 'ORD-007', 6, 8, 7, 5, 1450000, 1450000, 145000, 'PURCHASE', 'CARD', 4, 'COMPLETED', '2026-03-10 14:35:00');

-- ==========================================================
-- 11. 정산 (tbl_settlement) - 완료된 주문 5건
-- ==========================================================
insert into tbl_settlement (payment_id, member_id, pre_tax_amount, total_deduction, net_amount, effective_tax_rate, status, approved_at, paid_at, created_datetime)
values
    (1, 2, 2250000, 225000, 2025000, 10, 'PAID', '2026-03-21 10:00:00', '2026-03-22 10:00:00', '2026-03-20 15:00:00'),
    (2, 3, 1620000, 162000, 1458000, 10, 'PAID', '2026-03-19 10:00:00', '2026-03-20 10:00:00', '2026-03-18 17:00:00'),
    (4, 5, 2880000, 288000, 2592000, 10, 'PAID', '2026-03-16 10:00:00', '2026-03-17 10:00:00', '2026-03-15 19:00:00'),
    (5, 2, 1080000, 108000, 972000, 10, 'PAID', '2026-03-13 10:00:00', '2026-03-14 10:00:00', '2026-03-12 12:00:00'),
    (7, 8, 1305000, 130500, 1174500, 10, 'PAID', '2026-03-11 10:00:00', '2026-03-12 10:00:00', '2026-03-10 15:00:00');

-- ==========================================================
-- 12. 출금 요청 (tbl_withdrawal_request) - 6건
-- ==========================================================
insert into tbl_withdrawal_request (withdrawal_code, member_id, settlement_id, requested_amount, fee, net_amount, status, admin_id, rejected_reason, requested_at, approved_at, paid_at, bank_name, account_number, account_holder)
values
    ('WD-001', 3, 2, 2000000, 66000, 1934000, 'PENDING', null, null, '2026-03-28 09:00:00', null, null, '국민은행', '***-****-1234', '박서연'),
    ('WD-002', 2, 1, 800000, 26400, 773600, 'APPROVED', 1, null, '2026-03-27 14:00:00', '2026-03-27 16:00:00', null, '신한은행', '***-****-5678', '김지훈'),
    ('WD-003', 5, 3, 1500000, 49500, 1450500, 'PENDING', null, null, '2026-03-28 11:00:00', null, null, '우리은행', '***-****-9012', '최수진'),
    ('WD-004', 6, null, 500000, 16500, 483500, 'REJECTED', 1, '잔액 부족으로 반려합니다.', '2026-03-25 08:00:00', null, null, '하나은행', '***-****-3456', '정우현'),
    ('WD-005', 8, 5, 3200000, 105600, 3094400, 'APPROVED', 1, null, '2026-03-26 15:00:00', '2026-03-26 17:00:00', '2026-03-27 10:00:00', '국민은행', '***-****-7890', '윤은서'),
    ('WD-006', 7, null, 1200000, 39600, 1160400, 'PENDING', null, null, '2026-03-29 10:00:00', null, null, '신한은행', '***-****-2345', '강하늘');

-- ==========================================================
-- 13. 신고 (tbl_report) - 6건
-- ==========================================================
insert into tbl_report (reporter_id, target_type, target_id, reason, detail, status, resolved_at, resolved_memo, created_datetime)
values
    (3, 'WORK', 3, 'COPYRIGHT', '저작권 침해가 의심되는 작품입니다. 원작자의 허가 없이 복제한 것으로 보입니다.', 'PENDING', null, null, '2026-03-29 08:00:00'),
    (2, 'MEMBER', 7, 'HARASSMENT', '프로필에 부적절한 이미지와 욕설이 포함되어 있습니다.', 'PENDING', null, null, '2026-03-28 14:00:00'),
    (5, 'WORK', 3, 'SENSITIVE', '반 고흐 원작의 무단 모작으로 저작권 문제가 있습니다.', 'RESOLVED', '2026-03-26 10:00:00', '확인 결과 저작권 침해로 판단하여 작품 숨김 처리', '2026-03-25 09:00:00'),
    (6, 'COMMENT', 4, 'HARASSMENT', '댓글에 욕설 및 비하 발언이 포함되어 있습니다.', 'PENDING', null, null, '2026-03-28 18:00:00'),
    (8, 'WORK', 3, 'COPYRIGHT', '허위 신고로 확인되었습니다.', 'CANCELLED', '2026-03-21 11:00:00', '확인 결과 허위 신고로 판단하여 취소 처리', '2026-03-20 15:00:00'),
    (7, 'MEMBER', 6, 'HARASSMENT', '반복적인 스팸 메시지를 보내고 있습니다.', 'RESOLVED', '2026-03-28 10:00:00', '스팸 행위 확인, 경고 조치 완료', '2026-03-27 16:00:00');

-- ==========================================================
-- 14. 회원 이용 제한 (tbl_member_restriction)
-- ==========================================================
insert into tbl_member_restriction (member_id, report_id, restriction_type, reason, previous_member_status, status, start_datetime, end_datetime)
values
    (4, 3, 'LIMIT', '저작권 침해 작품 게시 및 누적 신고 3회', 'ACTIVE', 'ACTIVE', '2026-03-26 10:00:00', '2026-04-26 10:00:00'),
    (7, 2, 'BLOCK', '부적절한 프로필 및 누적 신고 2회', 'ACTIVE', 'ACTIVE', '2026-03-28 15:00:00', null);

-- ==========================================================
-- 15. 댓글 (tbl_comment) - 테스트용
-- ==========================================================
insert into tbl_comment (member_id, target_type, target_id, parent_id, content, like_count, created_datetime)
values
    (2, 'WORK', 1, null, '정말 아름다운 작품이네요!', 5, '2026-03-01 10:00:00'),
    (5, 'WORK', 1, null, '색감이 환상적입니다.', 3, '2026-03-02 14:00:00'),
    (6, 'WORK', 2, null, '야경 사진 중 최고입니다.', 7, '2026-03-03 09:00:00'),
    (4, 'WORK', 5, null, '디지털아트의 새로운 경지!', 2, '2026-03-05 16:00:00'),
    (8, 'WORK', 7, null, '노을이 너무 예쁘게 나왔어요.', 4, '2026-03-06 11:00:00'),
    (3, 'WORK', 4, null, '수채화의 투명한 느낌이 좋습니다.', 6, '2026-03-07 13:00:00'),
    (2, 'WORK', 1, 1, '감사합니다!', 1, '2026-03-01 12:00:00');

-- ==========================================================
-- 16. 북마크 (tbl_bookmark)
-- ==========================================================
insert into tbl_bookmark (member_id, target_type, target_id)
values
    (2, 'WORK', 1), (2, 'WORK', 4), (2, 'WORK', 7),
    (3, 'WORK', 2), (3, 'WORK', 5),
    (5, 'WORK', 1), (5, 'WORK', 2), (5, 'WORK', 7),
    (6, 'WORK', 1), (6, 'WORK', 5),
    (8, 'WORK', 1), (8, 'WORK', 2), (8, 'WORK', 4);

-- ==========================================================
-- 완료
-- ==========================================================
