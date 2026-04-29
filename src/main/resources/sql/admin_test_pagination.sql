-- ==========================================================
-- admin_test_pagination.sql
-- 페이지네이션 테스트용 추가 더미데이터 (100건+)
-- 기존 admin_test_table.sql 실행 후 이 파일 실행
-- 기존 데이터(member 1-8, work 1-7, auction 1-5 등)를 유지하며 추가
-- 시퀀스는 100부터 자동 증가 (overriding system value 사용 안 함)
-- ==========================================================
-- 기존 원본 데이터(id 1~8)만 남기고 전부 삭제
delete from tbl_withdrawal_request where id not in (1,2,3,4,5,6);
delete from tbl_settlement where id not in (1,2,3,4,5);
delete from tbl_payment where id not in (1,2,3,4,5,6,7);
delete from tbl_order where id not in (1,2,3,4,5,6,7);
delete from tbl_bid where member_id not in (1,2,3,4,5,6,7,8);
delete from tbl_auction where id not in (1,2,3,4,5);
delete from tbl_report where id not in (1,2,3,4,5,6);
delete from tbl_work where id not in (1,2,3,4,5,6,7);
delete from tbl_member where id not in (1,2,3,4,5,6,7,8);

-- 시퀀스 리셋
select setval(pg_get_serial_sequence('tbl_member', 'id'), 99);
select setval(pg_get_serial_sequence('tbl_work', 'id'), 99);
select setval(pg_get_serial_sequence('tbl_report', 'id'), 99);
select setval(pg_get_serial_sequence('tbl_auction', 'id'), 99);
select setval(pg_get_serial_sequence('tbl_order', 'id'), 99);
select setval(pg_get_serial_sequence('tbl_payment', 'id'), 99);
select setval(pg_get_serial_sequence('tbl_withdrawal_request', 'id'), 99);
select setval(pg_get_serial_sequence('tbl_bid', 'id'), 99);
select setval(pg_get_serial_sequence('tbl_settlement', 'id'), 99);
-- ==========================================================
-- 1. 추가 회원 (tbl_member) - 30명
-- 시퀀스가 100부터 시작하므로 id는 100~129 자동 생성
-- ==========================================================
insert into tbl_member (email, password, nickname, real_name, phone_number, role, creator_verified, seller_verified, creator_tier, follower_count, following_count, status, last_login_datetime, created_datetime)
values
    ('kim.jiho@naver.com',     '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '김지호',   '김지호',   '010-1001-0001', 'USER', true,  true,  'PREMIUM', 312, 54,  'ACTIVE',    '2026-03-31 09:00:00', '2025-01-10'),
    ('lee.sooyeon@gmail.com',  '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '이수연',   '이수연',   '010-1002-0002', 'USER', true,  true,  'PREMIUM', 245, 32,  'ACTIVE',    '2026-03-30 18:00:00', '2025-01-15'),
    ('park.daehun@daum.net',   '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '박대훈',   '박대훈',   '010-1003-0003', 'USER', false, false, 'BASIC',   78,  20,  'ACTIVE',    '2026-03-29 14:00:00', '2025-01-20'),
    ('choi.mirae@naver.com',   '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '최미래',   '최미래',   '010-1004-0004', 'USER', true,  false, 'BASIC',   134, 67,  'ACTIVE',    '2026-03-28 11:00:00', '2025-02-01'),
    ('jung.hayeon@gmail.com',  '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '정하연',   '정하연',   '010-1005-0005', 'USER', false, false, 'BASIC',   55,  44,  'SUSPENDED', '2026-03-20 09:00:00', '2025-02-05'),
    ('kang.junseok@naver.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '강준석',   '강준석',   '010-1006-0006', 'USER', true,  true,  'PREMIUM', 501, 88,  'ACTIVE',    '2026-03-31 08:00:00', '2025-02-10'),
    ('jo.yuri@hanmail.net',    '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '조유리',   '조유리',   '010-1007-0007', 'USER', true,  true,  'BASIC',   189, 41,  'ACTIVE',    '2026-03-30 21:00:00', '2025-02-15'),
    ('yoon.chanwoo@gmail.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '윤찬우',   '윤찬우',   '010-1008-0008', 'USER', false, false, 'BASIC',   23,  15,  'BANNED',    '2026-02-10 10:00:00', '2025-03-01'),
    ('jang.soomin@naver.com',  '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '장수민',   '장수민',   '010-1009-0009', 'USER', true,  false, 'BASIC',   98,  36,  'ACTIVE',    '2026-03-29 17:00:00', '2025-03-05'),
    ('lim.boram@daum.net',     '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '임보람',   '임보람',   '010-1010-0010', 'USER', false, false, 'BASIC',   42,  28,  'ACTIVE',    '2026-03-28 15:00:00', '2025-03-10'),
    ('shin.dongwoo@gmail.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '신동우',   '신동우',   '010-1011-0011', 'USER', true,  true,  'PREMIUM', 623, 102, 'ACTIVE',    '2026-03-31 12:00:00', '2025-03-15'),
    ('oh.jeeyoung@naver.com',  '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '오지영',   '오지영',   '010-1012-0012', 'USER', false, false, 'BASIC',   66,  33,  'ACTIVE',    '2026-03-27 10:00:00', '2025-04-01'),
    ('seo.minjun@hanmail.net', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '서민준',   '서민준',   '010-1013-0013', 'USER', true,  false, 'BASIC',   157, 49,  'SUSPENDED', '2026-03-15 08:00:00', '2025-04-05'),
    ('kwon.nahyun@gmail.com',  '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '권나현',   '권나현',   '010-1014-0014', 'USER', true,  true,  'PREMIUM', 378, 71,  'ACTIVE',    '2026-03-30 13:00:00', '2025-04-10'),
    ('han.seungho@naver.com',  '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '한승호',   '한승호',   '010-1015-0015', 'USER', false, false, 'BASIC',   31,  22,  'ACTIVE',    '2026-03-26 16:00:00', '2025-04-15'),
    ('yoo.jiwon@daum.net',     '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '유지원',   '유지원',   '010-1016-0016', 'USER', true,  true,  'BASIC',   211, 58,  'ACTIVE',    '2026-03-31 07:30:00', '2025-05-01'),
    ('moon.hyeji@gmail.com',   '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '문혜지',   '문혜지',   '010-1017-0017', 'USER', false, false, 'BASIC',   47,  19,  'ACTIVE',    '2026-03-29 20:00:00', '2025-05-05'),
    ('bae.seungjae@naver.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '배승재',   '배승재',   '010-1018-0018', 'USER', true,  true,  'PREMIUM', 445, 93,  'ACTIVE',    '2026-03-30 16:00:00', '2025-05-10'),
    ('cha.jiyun@hanmail.net',  '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '차지윤',   '차지윤',   '010-1019-0019', 'USER', false, false, 'BASIC',   88,  37,  'BANNED',    '2026-01-20 11:00:00', '2025-05-15'),
    ('hong.gildong@gmail.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '홍길동',   '홍길동',   '010-1020-0020', 'USER', true,  false, 'BASIC',   176, 62,  'ACTIVE',    '2026-03-28 09:30:00', '2025-06-01'),
    ('kim.sojeong@naver.com',  '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '김소정',   '김소정',   '010-1021-0021', 'USER', true,  true,  'PREMIUM', 289, 74,  'ACTIVE',    '2026-03-31 11:00:00', '2025-06-05'),
    ('lee.taewon@daum.net',    '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '이태원',   '이태원',   '010-1022-0022', 'USER', false, false, 'BASIC',   34,  16,  'SUSPENDED', '2026-03-10 14:00:00', '2025-06-10'),
    ('park.chaeyeon@gmail.com','$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '박채연',   '박채연',   '010-1023-0023', 'USER', true,  true,  'BASIC',   143, 55,  'ACTIVE',    '2026-03-30 10:00:00', '2025-06-15'),
    ('choi.hyunwoo@naver.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '최현우',   '최현우',   '010-1024-0024', 'USER', false, false, 'BASIC',   59,  27,  'ACTIVE',    '2026-03-29 15:00:00', '2025-07-01'),
    ('jung.yeonsu@hanmail.net','$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '정연수',   '정연수',   '010-1025-0025', 'USER', true,  false, 'BASIC',   202, 48,  'ACTIVE',    '2026-03-28 19:00:00', '2025-07-05'),
    ('kang.minji@gmail.com',   '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '강민지',   '강민지',   '010-1026-0026', 'USER', true,  true,  'PREMIUM', 534, 115, 'ACTIVE',    '2026-03-31 06:00:00', '2025-07-10'),
    ('jo.seunghyun@naver.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '조승현',   '조승현',   '010-1027-0027', 'USER', false, false, 'BASIC',   71,  39,  'ACTIVE',    '2026-03-27 12:00:00', '2025-07-15'),
    ('yoon.dahye@daum.net',    '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '윤다혜',   '윤다혜',   '010-1028-0028', 'USER', true,  false, 'BASIC',   118, 43,  'SUSPENDED', '2026-02-25 17:00:00', '2025-08-01'),
    ('jang.taeyang@gmail.com', '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '장태양',   '장태양',   '010-1029-0029', 'USER', true,  true,  'PREMIUM', 390, 80,  'ACTIVE',    '2026-03-30 14:30:00', '2025-08-05'),
    ('lim.yuna@naver.com',     '$2a$10$M.AEJK617idsc6Oge4yMz.u9seAaaOPA4TPbtzBowLrxeSdYUhsZ6', '임유나',   '임유나',   '010-1030-0030', 'USER', false, false, 'BASIC',   44,  21,  'ACTIVE',    '2026-03-29 08:00:00', '2025-08-10');


-- ==========================================================
-- 2. 추가 작품 (tbl_work) - 40개
-- member_id는 위에서 생성된 100~129 및 기존 2~8 참조
-- 시퀀스가 100부터 시작하므로 id는 100~139 자동 생성
-- ==========================================================
insert into tbl_work (member_id, title, category, description, price, license_type, is_tradable, allow_comment, show_similar, view_count, like_count, save_count, comment_count, status, created_datetime)
values
    -- creator_verified 회원들(100,101,103,105,106,108,110,113,115,116,117,120,122,124,125,128)의 작품
    (100, '빛의 소나타',         '유화',       '빛과 그림자의 대비로 표현한 음악적 감성의 유화',                         650000,  'PERSONAL',    true,  true,  true,  412, 67,  98,  14, 'ACTIVE', '2025-02-01'),
    (101, '도심 속 자연',        '사진',       '복잡한 도시 한복판에 숨겨진 작은 자연의 순간을 포착한 사진',             350000,  'PERSONAL',    true,  true,  true,  287, 43,  61,  9,  'ACTIVE', '2025-02-10'),
    (100, '추억의 색채',         '수채화',     '어린 시절의 따뜻한 기억을 수채화로 담아낸 작품',                         480000,  'COMMERCIAL',  true,  true,  true,  195, 31,  42,  7,  'ACTIVE', '2025-02-20'),
    (103, '몽환의 숲',           '디지털아트', '꿈속을 거니는 듯한 신비로운 숲을 디지털로 표현',                         300000,  'PERSONAL',    true,  true,  true,  538, 89,  124, 21, 'ACTIVE', '2025-03-01'),
    (105, '침묵의 무게',         '조각',       '철과 나무로 만든 현대적 조각, 침묵의 감정을 표현',                       1200000, 'EXCLUSIVE',   false, true,  true,  78,  12,  18,  4,  'ACTIVE', '2025-03-05'),
    (106, '한옥의 아침',         '수채화',     '전통 한옥 마당에 아침 햇살이 드리우는 순간을 수채화로',                  550000,  'PERSONAL',    true,  true,  true,  334, 54,  77,  11, 'ACTIVE', '2025-03-10'),
    (100, '파도와 시간',         '유화',       '파도가 깎아낸 절벽의 세월을 유화로 표현한 작품',                         720000,  'COMMERCIAL',  true,  true,  true,  156, 28,  39,  6,  'ACTIVE', '2025-03-15'),
    (108, '도시의 리듬',         '사진',       '바쁜 출퇴근 시간대 서울의 빠른 리듬을 장노출로 포착',                    280000,  'PERSONAL',    true,  true,  true,  623, 101, 155, 28, 'ACTIVE', '2025-03-20'),
    (110, '내면의 폭풍',         '디지털아트', '인간 내면의 혼란과 격동을 추상적 디지털 아트로 시각화',                  420000,  'PERSONAL',    true,  true,  true,  489, 76,  103, 18, 'ACTIVE', '2025-04-01'),
    (101, '벚꽃의 기억',         '수채화',     '봄날 벚꽃이 흩날리는 골목길의 서정적 풍경',                              390000,  'PERSONAL',    true,  true,  true,  701, 118, 167, 34, 'ACTIVE', '2025-04-05'),
    (113, '경계 너머',           '유화',       '현실과 환상의 경계를 초현실주의적으로 표현한 유화',                       880000,  'COMMERCIAL',  true,  true,  true,  243, 38,  51,  9,  'ACTIVE', '2025-04-10'),
    (105, '금속의 시',           '조각',       '일상 폐금속으로 제작한 추상 조각 작품',                                  null,    null,          false, true,  true,  92,  14,  20,  5,  'HIDDEN', '2025-04-15'),
    (115, '고요한 바다',         '사진',       '이른 새벽 동해에서 포착한 완전한 정적의 순간',                           450000,  'PERSONAL',    true,  true,  true,  512, 83,  119, 22, 'ACTIVE', '2025-04-20'),
    (116, '꿈의 건축',           '디지털아트', '존재하지 않는 아름다운 건축물을 디지털로 구현',                          260000,  'PERSONAL',    true,  true,  true,  374, 59,  84,  16, 'ACTIVE', '2025-05-01'),
    (106, '달항아리의 침묵',     '수채화',     '조선 백자 달항아리에서 영감받은 여백의 아름다움',                        600000,  'EXCLUSIVE',   false, true,  true,  167, 27,  38,  7,  'ACTIVE', '2025-05-05'),
    (117, '거리의 철학자',       '사진',       '서울 골목길에서 만난 다양한 인물들의 일상 포트레이트',                   320000,  'PERSONAL',    true,  true,  false, 445, 71,  98,  19, 'ACTIVE', '2025-05-10'),
    (110, '색채의 폭발',         '디지털아트', '색이 폭발하는 듯한 역동적 추상화, 3D 렌더링 작업',                       380000,  'COMMERCIAL',  true,  true,  true,  618, 99,  142, 27, 'ACTIVE', '2025-05-15'),
    (120, '봄밤의 노래',         '유화',       '봄밤 달빛 아래 들리는 개구리 소리를 유화로 시각화',                      530000,  'PERSONAL',    true,  true,  true,  302, 48,  66,  12, 'ACTIVE', '2025-06-01'),
    (113, '무제 - 불안',         '디지털아트', '현대인의 불안감을 표현한 추상 디지털 아트',                              null,    null,          false, false, true,  44,  6,   8,   1,  'HIDDEN', '2025-06-05'),
    (122, '포구의 새벽',         '사진',       '어촌 포구에서 새벽빛에 출항하는 어선을 담은 사진',                       280000,  'PERSONAL',    true,  true,  true,  389, 62,  89,  15, 'ACTIVE', '2025-06-10'),
    (115, '대지의 노래',         '유화',       '광활한 들판에 흐르는 바람을 감각적으로 표현한 유화',                     750000,  'COMMERCIAL',  true,  true,  true,  221, 35,  48,  8,  'ACTIVE', '2025-06-15'),
    (124, '디지털 초상',         '디지털아트', '전통 동양화 기법과 디지털 아트를 결합한 인물화',                         470000,  'PERSONAL',    true,  true,  true,  558, 90,  129, 24, 'ACTIVE', '2025-07-01'),
    (120, '녹슨 기억',           '사진',       '오래된 기계 부품에 새겨진 시간의 흔적을 접사로 포착',                    200000,  'PERSONAL',    true,  true,  true,  174, 28,  40,  7,  'ACTIVE', '2025-07-05'),
    (125, '빛의 정원',           '수채화',     '햇빛이 투과하는 온실 속 식물들의 생명력을 수채화로',                     620000,  'COMMERCIAL',  true,  true,  true,  437, 70,  99,  18, 'ACTIVE', '2025-07-10'),
    (116, '하늘의 건축가',       '사진',       '구름이 만들어내는 웅장한 형태를 포착한 하늘 사진',                       340000,  'PERSONAL',    true,  true,  true,  296, 47,  67,  11, 'ACTIVE', '2025-07-15'),
    (128, '강물의 시간',         '유화',       '계절에 따라 변하는 강의 모습을 4점 연작으로 표현',                       950000,  'EXCLUSIVE',   false, true,  true,  138, 22,  31,  6,  'ACTIVE', '2025-08-01'),
    (122, '잿빛 도시',           '사진',       '비 오는 날 서울 도심의 잿빛 풍경과 사람들',                              null,    null,          false, true,  true,  67,  10,  15,  3,  'HIDDEN', '2025-08-05'),
    (124, '환상의 숲 시리즈',    '디지털아트', '각기 다른 계절의 환상적인 숲을 담은 디지털 연작',                        560000,  'COMMERCIAL',  true,  true,  true,  712, 114, 163, 31, 'ACTIVE', '2025-08-10'),
    (125, '옹기 항아리',         '수채화',     '전통 옹기에서 느껴지는 소박한 아름다움을 수채화로',                      410000,  'PERSONAL',    true,  true,  true,  253, 40,  57,  10, 'ACTIVE', '2025-08-15'),
    (128, '겨울 나목',           '유화',       '눈 쌓인 들판에 홀로 서있는 나목의 강인함을 담은 유화',                   680000,  'PERSONAL',    true,  true,  true,  186, 30,  43,  8,  'ACTIVE', '2025-09-01'),
    -- 기존 회원(2~8)의 추가 작품
    (2,  '서울의 밤 II',         '사진',       '서울 남산에서 바라본 도시의 야경 시리즈 두 번째',                        320000,  'PERSONAL',    true,  true,  true,  498, 80,  115, 20, 'ACTIVE', '2025-09-05'),
    (3,  '봄의 전령',            '유화',       '봄을 알리는 매화꽃을 섬세하게 표현한 유화 작품',                         580000,  'COMMERCIAL',  true,  true,  true,  343, 55,  78,  13, 'ACTIVE', '2025-09-10'),
    (5,  '제주의 바람',          '수채화',     '제주 오름에 부는 바람의 감촉을 수채화로 담아냄',                          420000,  'PERSONAL',    true,  true,  true,  267, 43,  60,  11, 'ACTIVE', '2025-09-15'),
    (6,  '감정의 기하학',        '디지털아트', '인간 감정을 기하학적 패턴으로 추상화한 디지털 아트',                     350000,  'COMMERCIAL',  true,  true,  true,  589, 95,  137, 26, 'ACTIVE', '2025-10-01'),
    (8,  '황혼의 강',            '사진',       '낙조가 물드는 한강의 황혼을 포착한 풍경 사진',                           290000,  'PERSONAL',    true,  true,  true,  404, 65,  93,  17, 'ACTIVE', '2025-10-05'),
    (2,  '광화문의 사계',        '사진',       '광화문 광장의 봄 여름 가을 겨울을 담은 4점 연작',                        null,    null,          false, true,  true,  55,  8,   11,  2,  'HIDDEN', '2025-10-10'),
    (3,  '노을빛 추상',          '유화',       '노을의 색채를 추상적으로 해석한 대형 유화 작품',                         890000,  'EXCLUSIVE',   false, true,  true,  172, 27,  39,  7,  'ACTIVE', '2025-10-15'),
    (5,  '청춘의 흔적',          '수채화',     '청춘 시절의 풋풋한 감성을 따뜻한 수채화로 표현',                         490000,  'PERSONAL',    true,  true,  true,  318, 51,  73,  14, 'ACTIVE', '2025-11-01'),
    (6,  '도시 표본',            '디지털아트', '도시의 단면을 현미경으로 들여다보듯 표현한 디지털 작품',                 310000,  'PERSONAL',    true,  true,  true,  427, 68,  98,  18, 'ACTIVE', '2025-11-05'),
    (8,  '눈 내리는 북촌',       '사진',       '첫눈이 내리는 북촌 한옥마을의 아름다운 풍경',                            260000,  'PERSONAL',    true,  true,  true,  652, 105, 151, 29, 'ACTIVE', '2025-11-10');


-- ==========================================================
-- 3. 추가 신고 (tbl_report) - 30건
-- reporter_id, target_id 모두 유효한 member/work id 참조
-- ==========================================================
insert into tbl_report (reporter_id, target_type, target_id, reason, detail, status, resolved_at, resolved_memo, created_datetime)
values
    -- PENDING 신고 (10건)
    (100, 'WORK',   104, 'COPYRIGHT',    '해당 작품이 타인의 원작을 무단 복제한 것으로 보입니다.',                       'PENDING',   null,                    null, '2025-09-05 10:00:00'),
    (101, 'MEMBER', 107, 'HARASSMENT',   '해당 회원이 지속적으로 악성 댓글을 작성하고 있습니다.',                        'PENDING',   null,                    null, '2025-09-10 11:00:00'),
    (103, 'WORK',   112, 'SENSITIVE',    '미성년자가 보기에 부적절한 성적 이미지가 포함되어 있습니다.',                  'PENDING',   null,                    null, '2025-09-15 14:00:00'),
    (105, 'MEMBER', 118, 'IMPERSONATION','유명 작가의 작품을 자신의 것으로 속여 판매하고 있습니다.',                     'PENDING',   null,                    null, '2025-10-01 09:00:00'),
    (106, 'WORK',   120, 'COPYRIGHT',    '이 작품은 해외 유명 작가의 작품을 허가 없이 복제한 것입니다.',                 'PENDING',   null,                    null, '2025-10-05 13:00:00'),
    (108, 'COMMENT', 1,  'HARASSMENT',   '해당 댓글에 심한 욕설과 비하 발언이 포함되어 있습니다.',                      'PENDING',   null,                    null, '2025-10-10 16:00:00'),
    (110, 'WORK',   126, 'SENSITIVE',    '작품에 폭력적인 장면이 무분별하게 표현되어 있습니다.',                         'PENDING',   null,                    null, '2025-10-15 08:00:00'),
    (113, 'MEMBER', 119, 'HARASSMENT',   '반복적인 스팸성 메시지와 부적절한 컨텐츠를 지속 게시하고 있습니다.',           'PENDING',   null,                    null, '2025-11-01 12:00:00'),
    (115, 'WORK',   130, 'COPYRIGHT',    '상업적 목적으로 타인의 작품을 무단 도용한 정황이 있습니다.',                   'PENDING',   null,                    null, '2025-11-05 10:30:00'),
    (116, 'MEMBER', 107, 'IMPERSONATION','타인의 닉네임과 프로필을 도용하여 사기 행위를 하고 있습니다.',                 'PENDING',   null,                    null, '2025-11-10 15:00:00'),
    -- REVIEWING 신고 (8건)
    (117, 'WORK',   100, 'COPYRIGHT',    '유사한 작품이 타 사이트에서 다른 작가 명의로 게시된 것을 확인했습니다.',       'REVIEWING', null,                    null, '2025-07-01 09:00:00'),
    (120, 'MEMBER', 104, 'HARASSMENT',   '구매자에게 환불 거부 후 지속적인 위협 메시지를 발송하고 있습니다.',            'REVIEWING', null,                    null, '2025-07-05 14:00:00'),
    (100, 'WORK',   108, 'SENSITIVE',    '작품 설명에 혐오 발언과 차별적 표현이 다수 포함되어 있습니다.',                'REVIEWING', null,                    null, '2025-07-10 11:00:00'),
    (101, 'COMMENT', 3,  'HARASSMENT',   '타 작가를 겨냥한 인신공격성 댓글이 지속적으로 게시되고 있습니다.',             'REVIEWING', null,                    null, '2025-07-15 16:00:00'),
    (103, 'WORK',   114, 'COPYRIGHT',    '전시회 출품작과 동일한 작품이 무단 업로드된 것으로 확인됩니다.',               'REVIEWING', null,                    null, '2025-08-01 10:00:00'),
    (113, 'MEMBER', 121, 'IMPERSONATION','공식 기관을 사칭하여 회원 개인정보를 수집하려는 정황이 있습니다.',              'REVIEWING', null,                    null, '2025-08-05 13:00:00'),
    (115, 'WORK',   102, 'SENSITIVE',    '작품에 포함된 이미지가 아동 보호 관련 가이드라인을 위반합니다.',               'REVIEWING', null,                    null, '2025-08-10 09:30:00'),
    (128, 'MEMBER', 104, 'HARASSMENT',   '낙찰 후 의도적으로 결제를 지연하며 판매자를 괴롭히고 있습니다.',               'REVIEWING', null,                    null, '2025-08-15 17:00:00'),
    -- RESOLVED 신고 (7건)
    (108, 'WORK',   119, 'COPYRIGHT',    '타 플랫폼에서 동일 작품이 다른 작가 명의로 확인되어 신고합니다.',              'RESOLVED',  '2025-05-20 14:00:00',   '저작권 침해 확인, 작품 숨김 처리 완료', '2025-05-15 10:00:00'),
    (110, 'MEMBER', 107, 'HARASSMENT',   '댓글과 메시지를 통해 지속적으로 다른 작가를 비하하고 있습니다.',               'RESOLVED',  '2025-05-25 11:00:00',   '악성 댓글 다수 확인, 경고 조치 완료', '2025-05-20 09:00:00'),
    (100, 'WORK',   110, 'SENSITIVE',    '미성년자에게 유해한 콘텐츠가 별도 경고 없이 게시되어 있습니다.',               'RESOLVED',  '2025-06-05 16:00:00',   '유해 콘텐츠 확인, 연령 제한 설정 완료', '2025-06-01 14:00:00'),
    (106, 'COMMENT', 5,  'HARASSMENT',   '작가에 대한 인신공격 및 협박성 댓글이 게시되어 있습니다.',                     'RESOLVED',  '2025-06-10 10:00:00',   '협박성 댓글 확인, 해당 댓글 삭제 및 경고 처리', '2025-06-07 08:00:00'),
    (117, 'WORK',   106, 'COPYRIGHT',    '원작자 허가 없이 상업 목적으로 사용된 정황을 포착했습니다.',                   'RESOLVED',  '2025-04-10 15:00:00',   '무단 상업 이용 확인, 작품 비공개 처리', '2025-04-05 11:00:00'),
    (120, 'MEMBER', 118, 'IMPERSONATION','유명 작가를 사칭하여 고가 작품을 허위 판매한 정황이 있습니다.',                'RESOLVED',  '2025-04-20 13:00:00',   '사칭 행위 확인, 계정 정지 처리', '2025-04-15 09:00:00'),
    (122, 'WORK',   116, 'SENSITIVE',    '성인 등급 작품이 연령 제한 없이 공개되어 있습니다.',                           'RESOLVED',  '2025-03-15 11:00:00',   '연령 제한 미설정 확인, 성인 등급 적용 완료', '2025-03-10 10:00:00'),
    -- CANCELLED 신고 (5건)
    (116, 'WORK',   101, 'COPYRIGHT',    '유사한 주제의 작품이지만 독립적으로 창작한 것으로 확인됨',                     'CANCELLED', '2025-05-05 14:00:00',   '검토 결과 독립 창작물로 확인하여 취소', '2025-05-01 10:00:00'),
    (117, 'MEMBER', 100, 'HARASSMENT',   '오해로 인한 신고였습니다. 실제 harassment는 없었습니다.',                      'CANCELLED', '2025-05-10 11:00:00',   '확인 결과 오해로 인한 허위 신고로 판단', '2025-05-08 09:00:00'),
    (120, 'WORK',   103, 'SENSITIVE',    '검토 결과 가이드라인 위반 내용이 없어 취소 처리합니다.',                       'CANCELLED', '2025-03-25 15:00:00',   '가이드라인 위반 없음 확인, 취소 처리', '2025-03-20 13:00:00'),
    (122, 'COMMENT', 7,  'HARASSMENT',   '신고 내용 확인 결과 허위 신고로 판명되었습니다.',                              'CANCELLED', '2025-04-25 10:00:00',   '허위 신고로 판명, 취소 처리', '2025-04-20 09:00:00'),
    (124, 'MEMBER', 125, 'IMPERSONATION','신고 내용 검토 후 동명이인으로 확인하여 취소 처리합니다.',                     'CANCELLED', '2025-06-20 16:00:00',   '동명이인 확인, 취소 처리', '2025-06-15 14:00:00');


-- ==========================================================
-- 4. 추가 경매 (tbl_auction) - 15건
-- work_id: 위에서 생성된 100~139, seller_id는 100~129 및 2~8
-- 시퀀스가 100부터 시작하므로 id는 100~114 자동 생성
-- ==========================================================
insert into tbl_auction (work_id, seller_id, asking_price, starting_price, bid_increment, current_price, bid_count, fee_rate, fee_amount, settlement_amount, deadline_hours, started_at, closing_at, status, winner_id, final_price, created_datetime)
values
    -- SOLD (5건)
    (100, 100, 2000000, 650000,  10000, 1750000, 12, 0.15, 262500, 1487500, 48, '2025-09-01 10:00:00', '2025-09-03 10:00:00', 'SOLD',      103,  1750000, '2025-09-01'),
    (101, 101, 1500000, 350000,  10000, 1200000, 8,  0.15, 180000, 1020000, 48, '2025-09-10 14:00:00', '2025-09-12 14:00:00', 'SOLD',      105,  1200000, '2025-09-10'),
    (108, 108, 2500000, 280000,  10000, 2100000, 17, 0.15, 315000, 1785000, 72, '2025-10-01 09:00:00', '2025-10-04 09:00:00', 'SOLD',      110,  2100000, '2025-10-01'),
    (115, 115, 1800000, 450000,  10000, 1600000, 10, 0.15, 240000, 1360000, 48, '2025-10-20 11:00:00', '2025-10-22 11:00:00', 'SOLD',      117,  1600000, '2025-10-20'),
    (122, 122, 1000000, 280000,  10000, 880000,  7,  0.15, 132000, 748000,  48, '2025-11-05 13:00:00', '2025-11-07 13:00:00', 'SOLD',      124,  880000,  '2025-11-05'),
    -- ACTIVE (5건)
    (103, 103, 1500000, 300000,  10000, 520000,  3,  0.15, 78000,  422000,  72, '2026-03-30 10:00:00', '2026-04-02 10:00:00', 'ACTIVE',    null, null,    '2026-03-30'),
    (106, 106, 2200000, 550000,  10000, 1100000, 6,  0.15, 165000, 935000,  48, '2026-03-31 09:00:00', '2026-04-02 09:00:00', 'ACTIVE',    null, null,    '2026-03-31'),
    (110, 110, 1800000, 420000,  10000, 840000,  4,  0.15, 126000, 714000,  48, '2026-03-31 14:00:00', '2026-04-02 14:00:00', 'ACTIVE',    null, null,    '2026-03-31'),
    (124, 124, 2700000, 560000,  10000, 1400000, 9,  0.15, 210000, 1190000, 72, '2026-03-29 11:00:00', '2026-04-01 11:00:00', 'ACTIVE',    null, null,    '2026-03-29'),
    (128, 128, 3000000, 950000,  10000, 1900000, 11, 0.15, 285000, 1615000, 48, '2026-03-30 15:00:00', '2026-04-01 15:00:00', 'ACTIVE',    null, null,    '2026-03-30'),
    -- CLOSED (2건)
    (113, 113, 2000000, 880000,  10000, 1600000, 8,  0.15, 240000, 1360000, 48, '2026-03-25 10:00:00', '2026-03-27 10:00:00', 'CLOSED',    null, null,    '2026-03-25'),
    (116, 116, 1200000, 260000,  10000, 980000,  5,  0.15, 147000, 833000,  48, '2026-03-26 13:00:00', '2026-03-28 13:00:00', 'CLOSED',    null, null,    '2026-03-26'),
    -- CANCELLED (3건)
    (105, 105, 3000000, 1200000, 20000, null,    0,  0.15, 180000, 1020000, 48, '2025-12-01 10:00:00', '2025-12-03 10:00:00', 'CANCELLED', null, null,    '2025-12-01'),
    (120, 120, 1600000, 530000,  10000, 700000,  3,  0.15, 105000, 595000,  48, '2025-12-10 14:00:00', '2025-12-12 14:00:00', 'CANCELLED', null, null,    '2025-12-10'),
    (125, 125, 2400000, 620000,  10000, null,    0,  0.15, 93000,  527000,  72, '2026-01-05 09:00:00', '2026-01-08 09:00:00', 'CANCELLED', null, null,    '2026-01-05');


-- ==========================================================
-- 5. 추가 주문 (tbl_order) - 20건
-- buyer_id != seller_id 제약 준수
-- work_id: 100~139, 1~7 범위에서 참조
-- 시퀀스가 100부터 시작하므로 id는 100~119 자동 생성
-- ==========================================================
insert into tbl_order (order_code, buyer_id, seller_id, work_id, auction_id, order_type, license_type, original_price, fee_amount, total_price, ordered_at, paid_at, completed_at, status)
values
    ('ORD-100', 103, 100, 100, 100, 'AUCTION',  'PERSONAL',    1750000, 175000, 1750000, '2025-09-03 10:30:00', '2025-09-03 10:35:00', '2025-09-03 10:35:00', 'COMPLETED'),
    ('ORD-101', 105, 101, 101, 101, 'AUCTION',  'PERSONAL',    1200000, 120000, 1200000, '2025-09-12 14:30:00', '2025-09-12 14:38:00', '2025-09-12 14:38:00', 'COMPLETED'),
    ('ORD-102', 110, 108, 108, 102, 'AUCTION',  'PERSONAL',    2100000, 210000, 2100000, '2025-10-04 09:30:00', '2025-10-04 09:42:00', '2025-10-04 09:42:00', 'COMPLETED'),
    ('ORD-103', 117, 115, 115, 103, 'AUCTION',  'PERSONAL',    1600000, 160000, 1600000, '2025-10-22 11:30:00', '2025-10-22 11:40:00', '2025-10-22 11:40:00', 'COMPLETED'),
    ('ORD-104', 124, 122, 122, 104, 'AUCTION',  'PERSONAL',    880000,  88000,  880000,  '2025-11-07 13:30:00', '2025-11-07 13:45:00', '2025-11-07 13:45:00', 'COMPLETED'),
    ('ORD-105', 101, 100, 102, null,'DIRECT',   'PERSONAL',    480000,  48000,  480000,  '2025-10-15 10:00:00', '2025-10-15 10:05:00', '2025-10-15 10:05:00', 'COMPLETED'),
    ('ORD-106', 103, 100, 106, null,'DIRECT',   'COMMERCIAL',  550000,  55000,  550000,  '2025-10-20 14:00:00', '2025-10-20 14:08:00', '2025-10-20 14:08:00', 'COMPLETED'),
    ('ORD-107', 106, 103, 103, null,'DIRECT',   'PERSONAL',    300000,  30000,  300000,  '2025-11-10 09:00:00', null,                  null,                  'CANCELLED'),
    ('ORD-108', 108, 105, 105, null,'DIRECT',   'EXCLUSIVE',   1200000, 120000, 1200000, '2025-11-15 13:00:00', '2025-11-15 13:12:00', '2025-11-15 13:12:00', 'COMPLETED'),
    ('ORD-109', 110, 106, 106, null,'DIRECT',   'PERSONAL',    550000,  55000,  550000,  '2025-11-20 16:00:00', null,                  null,                  'CANCELLED'),
    ('ORD-110', 113, 108, 108, null,'DIRECT',   'PERSONAL',    280000,  28000,  280000,  '2025-12-01 10:00:00', '2025-12-01 10:06:00', '2025-12-01 10:06:00', 'COMPLETED'),
    ('ORD-111', 115, 110, 109, null,'DIRECT',   'COMMERCIAL',  420000,  42000,  420000,  '2025-12-05 14:00:00', '2025-12-05 14:10:00', '2025-12-05 14:10:00', 'COMPLETED'),
    ('ORD-112', 116, 113, 111, null,'DIRECT',   'PERSONAL',    880000,  88000,  880000,  '2025-12-10 09:00:00', '2025-12-10 09:08:00', '2025-12-10 09:08:00', 'COMPLETED'),
    ('ORD-113', 117, 115, 112, null,'DIRECT',   'PERSONAL',    450000,  45000,  450000,  '2025-12-15 11:00:00', null,                  null,                  'CANCELLED'),
    ('ORD-114', 120, 116, 113, null,'DIRECT',   'PERSONAL',    260000,  26000,  260000,  '2026-01-05 10:00:00', '2026-01-05 10:05:00', '2026-01-05 10:05:00', 'COMPLETED'),
    ('ORD-115', 122, 117, 116, null,'DIRECT',   'COMMERCIAL',  320000,  32000,  320000,  '2026-01-10 14:00:00', '2026-01-10 14:07:00', '2026-01-10 14:07:00', 'COMPLETED'),
    ('ORD-116', 124, 120, 117, null,'DIRECT',   'PERSONAL',    530000,  53000,  530000,  '2026-01-15 09:00:00', '2026-01-15 09:09:00', '2026-01-15 09:09:00', 'COMPLETED'),
    ('ORD-117', 125, 122, 119, null,'DIRECT',   'PERSONAL',    280000,  28000,  280000,  '2026-02-01 10:00:00', null,                  null,                  'CANCELLED'),
    ('ORD-118', 128, 124, 121, null,'DIRECT',   'COMMERCIAL',  470000,  47000,  470000,  '2026-02-10 14:00:00', '2026-02-10 14:11:00', '2026-02-10 14:11:00', 'COMPLETED'),
    ('ORD-119', 100, 125, 123, null,'DIRECT',   'PERSONAL',    620000,  62000,  620000,  '2026-02-15 09:00:00', '2026-02-15 09:08:00', '2026-02-15 09:08:00', 'COMPLETED');


-- ==========================================================
-- 6. 추가 결제 (tbl_payment) - 20건
-- buyer_id != seller_id 제약 준수
-- 완료된 주문에 대한 결제 레코드
-- ==========================================================
insert into tbl_payment (payment_code, order_code, buyer_id, seller_id, work_id, auction_id, original_amount, total_price, total_fee, payment_purpose, pay_method, status, paid_at)
values
    ('PAY-100', 'ORD-100', 103, 100, 100, 100, 1750000, 1750000, 175000, 'PURCHASE', 'CARD',      'COMPLETED', '2025-09-03 10:35:00'),
    ('PAY-101', 'ORD-101', 105, 101, 101, 101, 1200000, 1200000, 120000, 'PURCHASE', 'KAKAO_PAY', 'COMPLETED', '2025-09-12 14:38:00'),
    ('PAY-102', 'ORD-102', 110, 108, 108, 102, 2100000, 2100000, 210000, 'PURCHASE', 'CARD',      'COMPLETED', '2025-10-04 09:42:00'),
    ('PAY-103', 'ORD-103', 117, 115, 115, 103, 1600000, 1600000, 160000, 'PURCHASE', 'CARD',      'COMPLETED', '2025-10-22 11:40:00'),
    ('PAY-104', 'ORD-104', 124, 122, 122, 104, 880000,  880000,  88000,  'PURCHASE', 'KAKAO_PAY', 'COMPLETED', '2025-11-07 13:45:00'),
    ('PAY-105', 'ORD-105', 101, 100, 102, null,480000,  480000,  48000,  'PURCHASE', 'CARD',      'COMPLETED', '2025-10-15 10:05:00'),
    ('PAY-106', 'ORD-106', 103, 100, 106, null,550000,  550000,  55000,  'PURCHASE', 'CARD',      'COMPLETED', '2025-10-20 14:08:00'),
    ('PAY-107', 'ORD-107', 106, 103, 103, null,300000,  300000,  30000,  'PURCHASE', 'KAKAO_PAY', 'CANCELLED', '2025-11-10 09:05:00'),
    ('PAY-108', 'ORD-108', 108, 105, 105, null,1200000, 1200000, 120000, 'PURCHASE', 'CARD',      'COMPLETED', '2025-11-15 13:12:00'),
    ('PAY-109', 'ORD-109', 110, 106, 106, null,550000,  550000,  55000,  'PURCHASE', 'CARD',      'CANCELLED', '2025-11-20 16:05:00'),
    ('PAY-110', 'ORD-110', 113, 108, 108, null,280000,  280000,  28000,  'PURCHASE', 'KAKAO_PAY', 'COMPLETED', '2025-12-01 10:06:00'),
    ('PAY-111', 'ORD-111', 115, 110, 109, null,420000,  420000,  42000,  'PURCHASE', 'CARD',      'COMPLETED', '2025-12-05 14:10:00'),
    ('PAY-112', 'ORD-112', 116, 113, 111, null,880000,  880000,  88000,  'PURCHASE', 'CARD',      'COMPLETED', '2025-12-10 09:08:00'),
    ('PAY-113', 'ORD-113', 117, 115, 112, null,450000,  450000,  45000,  'PURCHASE', 'KAKAO_PAY', 'CANCELLED', '2025-12-15 11:05:00'),
    ('PAY-114', 'ORD-114', 120, 116, 113, null,260000,  260000,  26000,  'PURCHASE', 'CARD',      'COMPLETED', '2026-01-05 10:05:00'),
    ('PAY-115', 'ORD-115', 122, 117, 116, null,320000,  320000,  32000,  'PURCHASE', 'CARD',      'COMPLETED', '2026-01-10 14:07:00'),
    ('PAY-116', 'ORD-116', 124, 120, 117, null,530000,  530000,  53000,  'PURCHASE', 'KAKAO_PAY', 'COMPLETED', '2026-01-15 09:09:00'),
    ('PAY-117', 'ORD-117', 125, 122, 119, null,280000,  280000,  28000,  'PURCHASE', 'CARD',      'CANCELLED', '2026-02-01 10:05:00'),
    ('PAY-118', 'ORD-118', 128, 124, 121, null,470000,  470000,  47000,  'PURCHASE', 'CARD',      'COMPLETED', '2026-02-10 14:11:00'),
    ('PAY-119', 'ORD-119', 100, 125, 123, null,620000,  620000,  62000,  'PURCHASE', 'KAKAO_PAY', 'COMPLETED', '2026-02-15 09:08:00');


-- ==========================================================
-- 7. 추가 출금 요청 (tbl_withdrawal_request) - 10건
-- member_id는 creator_verified=true인 회원들 중심
-- settlement_id는 null로 처리 (정산 레코드 없이 독립 테스트)
-- ==========================================================
insert into tbl_withdrawal_request (withdrawal_code, member_id, settlement_id, requested_amount, fee, net_amount, status, admin_id, rejected_reason, requested_at, approved_at, paid_at, bank_name, account_number, account_holder)
values
    ('WD-100', 100, null, 1500000, 49500,  1450500, 'PENDING',  null, null,                              '2026-03-25 10:00:00', null,                    null,                    '국민은행', '***-****-1001', '김지호'),
    ('WD-101', 101, null, 900000,  29700,  870300,  'APPROVED', 1,    null,                              '2026-03-20 14:00:00', '2026-03-20 16:30:00',   null,                    '신한은행', '***-****-1002', '이수연'),
    ('WD-102', 105, null, 2000000, 66000,  1934000, 'PAID',     1,    null,                              '2026-03-10 09:00:00', '2026-03-10 11:00:00',   '2026-03-12 10:00:00',   '하나은행', '***-****-1005', '강준석'),
    ('WD-103', 106, null, 700000,  23100,  676900,  'REJECTED', 1,    '계좌 정보 불일치로 인해 반려합니다.', '2026-03-15 11:00:00', null,                    null,                    '우리은행', '***-****-1006', '조유리'),
    ('WD-104', 108, null, 3500000, 115500, 3384500, 'PAID',     1,    null,                              '2026-03-05 08:00:00', '2026-03-05 10:00:00',   '2026-03-07 10:00:00',   '국민은행', '***-****-1008', '신동우'),
    ('WD-105', 110, null, 1200000, 39600,  1160400, 'PENDING',  null, null,                              '2026-03-28 15:00:00', null,                    null,                    '카카오뱅크', '***-****-1010', '배승재'),
    ('WD-106', 113, null, 800000,  26400,  773600,  'APPROVED', 1,    null,                              '2026-03-22 10:00:00', '2026-03-22 14:00:00',   null,                    '신한은행', '***-****-1013', '권나현'),
    ('WD-107', 115, null, 2500000, 82500,  2417500, 'PAID',     1,    null,                              '2026-03-01 09:00:00', '2026-03-01 11:00:00',   '2026-03-03 10:00:00',   '하나은행', '***-****-1015', '유지원'),
    ('WD-108', 120, null, 600000,  19800,  580200,  'REJECTED', 1,    '출금 가능 금액 초과로 반려합니다.',   '2026-03-18 16:00:00', null,                    null,                    '우리은행', '***-****-1020', '홍길동'),
    ('WD-109', 128, null, 4000000, 132000, 3868000, 'PENDING',  null, null,                              '2026-03-30 11:00:00', null,                    null,                    '국민은행', '***-****-1028', '장태양');


-- ==========================================================
-- 완료: 추가 데이터 삽입 완료
-- 회원 30명 (id 100~129)
-- 작품 40개 (id 100~139)
-- 신고 30건 (id 100~129)
-- 경매 15건 (id 100~114)
-- 주문 20건 (id 100~119)
-- 결제 20건 (id 100~119)
-- 출금 요청 10건 (id 100~109)
-- ==========================================================
