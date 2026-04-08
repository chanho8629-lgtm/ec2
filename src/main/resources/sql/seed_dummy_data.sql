-- ============================================================
-- BIDEO 더미 데이터: 멤버 10명 + 작품 50개 + 파일 50개 + 예술관 5개
-- PostgreSQL용
-- ============================================================

-- 기존 더미 데이터 정리 (필요 시)
-- DELETE FROM tbl_gallery_work WHERE gallery_id IN (SELECT id FROM tbl_gallery WHERE title LIKE '[DEMO]%');
-- DELETE FROM tbl_gallery WHERE title LIKE '[DEMO]%';
-- DELETE FROM tbl_work_file WHERE work_id IN (SELECT id FROM tbl_work WHERE title LIKE '[DEMO]%');
-- DELETE FROM tbl_work WHERE title LIKE '[DEMO]%';
-- DELETE FROM tbl_member WHERE email LIKE 'demo%@bideo.kr';

-- ── 1. 멤버 10명 ──────────────────────────────────────────
-- password: 'Demo1234!' → BCrypt
INSERT INTO tbl_member (email, password, nickname, real_name, bio, profile_image, role, creator_verified, seller_verified, creator_tier, follower_count, following_count, gallery_count, status, created_datetime, updated_datetime)
VALUES
('demo01@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '디자인하는민지', '김민지', '공간과 색감을 탐구하는 영상 디자이너입니다.', '/images/sample/avatar_01.png', 'USER', true, false, 'BASIC', 342, 128, 1, 'ACTIVE', now() - interval '90 days', now()),
('demo02@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '여행가수현', '박수현', '세계를 담는 여행 영상 크리에이터.', '/images/sample/avatar_02.png', 'USER', true, false, 'BASIC', 891, 234, 1, 'ACTIVE', now() - interval '85 days', now()),
('demo03@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '요리하는지훈', '이지훈', '음식의 아름다움을 영상으로 기록합니다.', '/images/sample/avatar_03.png', 'USER', false, false, 'BASIC', 567, 89, 1, 'ACTIVE', now() - interval '80 days', now()),
('demo04@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '포토그래퍼은서', '최은서', '빛과 그림자로 이야기하는 시네마토그래퍼.', '/images/sample/avatar_04.png', 'USER', true, true, 'PREMIUM', 1523, 312, 1, 'ACTIVE', now() - interval '120 days', now()),
('demo05@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'art_studio_kr', '정예린', '실험적 영상 아트를 만듭니다.', '/images/sample/avatar_05.png', 'USER', true, false, 'BASIC', 2104, 456, 1, 'ACTIVE', now() - interval '150 days', now()),
('demo06@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '인테리어소희', '한소희', '공간 인테리어 영상 전문 크리에이터.', '/images/sample/avatar_06.png', 'USER', false, false, 'BASIC', 234, 67, 0, 'ACTIVE', now() - interval '60 days', now()),
('demo07@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '패션블로거하늘', '오하늘', '스타일과 무드를 영상으로 담습니다.', '/images/sample/avatar_07.png', 'USER', false, false, 'BASIC', 178, 91, 0, 'ACTIVE', now() - interval '45 days', now()),
('demo08@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'diy_master', '강도윤', 'DIY와 핸드메이드 영상 콘텐츠 제작.', '/images/sample/avatar_08.png', 'USER', true, true, 'PREMIUM', 3201, 543, 0, 'ACTIVE', now() - interval '200 days', now()),
('demo09@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '영상작가현우', '서현우', '시적인 영상미를 추구하는 영상작가.', '/images/sample/avatar_09.png', 'USER', true, false, 'BASIC', 789, 201, 0, 'ACTIVE', now() - interval '100 days', now()),
('demo10@bideo.kr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '크리에이터지아', '윤지아', '감성 브이로그와 다큐멘터리 제작.', '/images/sample/avatar_10.png', 'USER', false, false, 'BASIC', 456, 123, 0, 'ACTIVE', now() - interval '30 days', now());

-- ── 2. 작품 50개 ──────────────────────────────────────────
-- 멤버 ID를 변수로 사용하기 위해 서브쿼리 활용
-- 멤버 1 (디자인하는민지) 작품 5개
INSERT INTO tbl_work (member_id, title, category, description, price, license_type, is_tradable, allow_comment, show_similar, view_count, like_count, save_count, comment_count, status, created_datetime, updated_datetime)
VALUES
((SELECT id FROM tbl_member WHERE email='demo01@bideo.kr'), '모던 인테리어 디자인', 'FILM', '미니멀한 공간 디자인의 아름다움을 담은 영상입니다.', 50000, 'STANDARD', true, true, true, 1823, 234, 89, 12, 'ACTIVE', now() - interval '88 days', now()),
((SELECT id FROM tbl_member WHERE email='demo01@bideo.kr'), '감성 사진 모음', 'SHORT_FILM', '일상 속 숨겨진 아름다움을 포착한 포토 에세이 영상.', 30000, 'STANDARD', true, true, true, 945, 156, 67, 8, 'ACTIVE', now() - interval '75 days', now()),
((SELECT id FROM tbl_member WHERE email='demo01@bideo.kr'), '브랜드 디자인 영감', 'FILM', '글로벌 브랜드의 디자인 철학을 분석한 영상.', 80000, 'EXTENDED', true, true, true, 3421, 567, 234, 45, 'ACTIVE', now() - interval '60 days', now()),
((SELECT id FROM tbl_member WHERE email='demo01@bideo.kr'), '타이포그래피 디자인', 'ANIMATION', '활자가 살아 움직이는 모션 타이포그래피.', 45000, 'STANDARD', true, true, true, 2156, 345, 123, 23, 'ACTIVE', now() - interval '40 days', now()),
((SELECT id FROM tbl_member WHERE email='demo01@bideo.kr'), '북유럽 스타일 리빙', 'DOCUMENTARY', '스칸디나비안 라이프스타일 다큐멘터리.', 60000, 'STANDARD', false, true, true, 1567, 289, 98, 15, 'ACTIVE', now() - interval '20 days', now()),

-- 멤버 2 (여행가수현) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo02@bideo.kr'), '제주도 여행 명소', 'DOCUMENTARY', '제주의 숨은 명소를 찾아 떠나는 여행 다큐.', 35000, 'STANDARD', true, true, true, 5678, 891, 345, 67, 'ACTIVE', now() - interval '83 days', now()),
((SELECT id FROM tbl_member WHERE email='demo02@bideo.kr'), '산속 힐링 여행', 'FILM', '깊은 산속에서 찾은 평온한 시간.', 25000, 'STANDARD', true, true, true, 3456, 567, 213, 34, 'ACTIVE', now() - interval '70 days', now()),
((SELECT id FROM tbl_member WHERE email='demo02@bideo.kr'), '유럽 소도시 여행', 'DOCUMENTARY', '유럽의 작은 마을들을 걸으며 담은 영상.', 70000, 'EXTENDED', true, true, true, 8923, 1234, 567, 89, 'ACTIVE', now() - interval '55 days', now()),
((SELECT id FROM tbl_member WHERE email='demo02@bideo.kr'), '일본 건축 탐방', 'DOCUMENTARY', '일본 현대 건축의 미학을 탐구합니다.', 55000, 'STANDARD', true, true, true, 4321, 678, 234, 45, 'ACTIVE', now() - interval '35 days', now()),
((SELECT id FROM tbl_member WHERE email='demo02@bideo.kr'), '숲속 캠핑', 'FILM', '자연 속에서 보내는 하룻밤 캠핑 브이로그.', 20000, 'STANDARD', false, true, true, 2345, 345, 156, 23, 'ACTIVE', now() - interval '15 days', now()),

-- 멤버 3 (요리하는지훈) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo03@bideo.kr'), '홈메이드 파스타 레시피', 'SHORT_FILM', '집에서 만드는 정통 이탈리안 파스타.', 15000, 'STANDARD', true, true, true, 6789, 1023, 456, 78, 'ACTIVE', now() - interval '78 days', now()),
((SELECT id FROM tbl_member WHERE email='demo03@bideo.kr'), '건강한 브런치 메뉴', 'SHORT_FILM', '영양 가득한 주말 브런치 레시피 모음.', 12000, 'STANDARD', true, true, true, 3456, 534, 198, 34, 'ACTIVE', now() - interval '65 days', now()),
((SELECT id FROM tbl_member WHERE email='demo03@bideo.kr'), '한식 파인다이닝', 'FILM', '전통 한식을 현대적으로 재해석한 요리 영상.', 40000, 'STANDARD', true, true, true, 5123, 789, 312, 56, 'ACTIVE', now() - interval '50 days', now()),
((SELECT id FROM tbl_member WHERE email='demo03@bideo.kr'), '디저트 플레이팅', 'SHORT_FILM', '아름다운 디저트 플레이팅 기법.', 18000, 'STANDARD', false, true, true, 2890, 423, 167, 28, 'ACTIVE', now() - interval '30 days', now()),
((SELECT id FROM tbl_member WHERE email='demo03@bideo.kr'), '스트리트 푸드 탐방', 'DOCUMENTARY', '전 세계 길거리 음식을 탐방합니다.', 25000, 'STANDARD', true, true, true, 4567, 678, 289, 45, 'ACTIVE', now() - interval '10 days', now()),

-- 멤버 4 (포토그래퍼은서) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo04@bideo.kr'), '수채화 일러스트', 'ANIMATION', '수채화 기법으로 그린 애니메이션 단편.', 90000, 'EXTENDED', true, true, true, 7890, 1345, 567, 89, 'ACTIVE', now() - interval '118 days', now()),
((SELECT id FROM tbl_member WHERE email='demo04@bideo.kr'), '필름 카메라 감성', 'FILM', '아날로그 필름으로 담은 도시의 감성.', 65000, 'STANDARD', true, true, true, 5432, 876, 345, 56, 'ACTIVE', now() - interval '100 days', now()),
((SELECT id FROM tbl_member WHERE email='demo04@bideo.kr'), '빛과 그림자', 'SHORT_FILM', '빛의 움직임을 추적한 실험적 영상.', 75000, 'EXTENDED', true, true, true, 3210, 534, 213, 34, 'ACTIVE', now() - interval '80 days', now()),
((SELECT id FROM tbl_member WHERE email='demo04@bideo.kr'), '도시의 밤', 'FILM', '네온사인이 빛나는 도시의 밤풍경.', 55000, 'STANDARD', true, true, true, 4567, 723, 298, 47, 'ACTIVE', now() - interval '60 days', now()),
((SELECT id FROM tbl_member WHERE email='demo04@bideo.kr'), '시네마틱 포트레이트', 'SHORT_FILM', '영화적 조명으로 촬영한 인물 영상.', 85000, 'EXTENDED', true, true, true, 6789, 1098, 456, 72, 'ACTIVE', now() - interval '40 days', now()),

-- 멤버 5 (art_studio_kr) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo05@bideo.kr'), '귀여운 캐릭터 일러스트', 'ANIMATION', '오리지널 캐릭터 애니메이션 시리즈.', 120000, 'EXTENDED', true, true, true, 12345, 2345, 890, 123, 'ACTIVE', now() - interval '148 days', now()),
((SELECT id FROM tbl_member WHERE email='demo05@bideo.kr'), '동화풍 일러스트', 'ANIMATION', '동화 속 세계를 애니메이션으로 표현.', 95000, 'EXTENDED', true, true, true, 8765, 1567, 678, 89, 'ACTIVE', now() - interval '130 days', now()),
((SELECT id FROM tbl_member WHERE email='demo05@bideo.kr'), '추상 모션 아트', 'ANIMATION', '추상적 형태가 춤추는 모션 그래픽.', 70000, 'STANDARD', true, true, true, 4321, 678, 267, 45, 'ACTIVE', now() - interval '110 days', now()),
((SELECT id FROM tbl_member WHERE email='demo05@bideo.kr'), '디지털 아트 프로세스', 'SHORT_FILM', '디지털 아트 제작 과정을 담은 타임랩스.', 45000, 'STANDARD', false, true, true, 3456, 534, 198, 34, 'ACTIVE', now() - interval '90 days', now()),
((SELECT id FROM tbl_member WHERE email='demo05@bideo.kr'), '미디어 아트 전시', 'DOCUMENTARY', '현대 미디어 아트 전시 현장 다큐.', 60000, 'STANDARD', true, true, true, 5678, 891, 345, 56, 'ACTIVE', now() - interval '70 days', now()),

-- 멤버 6 (인테리어소희) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo06@bideo.kr'), '카페 인테리어 투어', 'DOCUMENTARY', '서울 감성 카페 인테리어 투어.', 20000, 'STANDARD', true, true, true, 3890, 567, 234, 38, 'ACTIVE', now() - interval '58 days', now()),
((SELECT id FROM tbl_member WHERE email='demo06@bideo.kr'), 'DIY 홈데코 아이디어', 'SHORT_FILM', '쉽게 따라하는 홈데코 DIY 영상.', 10000, 'STANDARD', true, true, true, 5670, 823, 345, 56, 'ACTIVE', now() - interval '48 days', now()),
((SELECT id FROM tbl_member WHERE email='demo06@bideo.kr'), '원룸 인테리어 변신', 'FILM', '좁은 원룸을 넓어 보이게 만드는 팁.', 15000, 'STANDARD', false, true, true, 7123, 1045, 456, 72, 'ACTIVE', now() - interval '38 days', now()),
((SELECT id FROM tbl_member WHERE email='demo06@bideo.kr'), '플랜테리어 가이드', 'SHORT_FILM', '식물로 공간을 꾸미는 플랜테리어.', 12000, 'STANDARD', true, true, true, 2345, 356, 134, 23, 'ACTIVE', now() - interval '25 days', now()),
((SELECT id FROM tbl_member WHERE email='demo06@bideo.kr'), '조명 인테리어', 'SHORT_FILM', '조명 하나로 달라지는 공간의 분위기.', 18000, 'STANDARD', true, true, true, 1890, 278, 98, 15, 'ACTIVE', now() - interval '12 days', now()),

-- 멤버 7 (패션블로거하늘) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo07@bideo.kr'), '가을 패션 코디', 'SHORT_FILM', '가을 시즌 데일리 패션 룩북.', 15000, 'STANDARD', true, true, true, 4560, 678, 267, 45, 'ACTIVE', now() - interval '43 days', now()),
((SELECT id FROM tbl_member WHERE email='demo07@bideo.kr'), '빈티지 스타일링', 'SHORT_FILM', '빈티지 아이템으로 완성하는 레트로 룩.', 12000, 'STANDARD', true, true, true, 3210, 489, 189, 32, 'ACTIVE', now() - interval '35 days', now()),
((SELECT id FROM tbl_member WHERE email='demo07@bideo.kr'), '심플한 라이프스타일', 'FILM', '미니멀 라이프를 실천하는 일상 브이로그.', 20000, 'STANDARD', false, true, true, 2890, 423, 167, 28, 'ACTIVE', now() - interval '28 days', now()),
((SELECT id FROM tbl_member WHERE email='demo07@bideo.kr'), '컬러 매칭 가이드', 'SHORT_FILM', '색상 조합으로 완성하는 스타일링.', 10000, 'STANDARD', true, true, true, 1567, 234, 89, 15, 'ACTIVE', now() - interval '18 days', now()),
((SELECT id FROM tbl_member WHERE email='demo07@bideo.kr'), '액세서리 컬렉션', 'SHORT_FILM', '시즌별 추천 액세서리 하울.', 8000, 'STANDARD', true, true, true, 1234, 189, 78, 12, 'ACTIVE', now() - interval '8 days', now()),

-- 멤버 8 (diy_master) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo08@bideo.kr'), '핸드메이드 악세서리', 'SHORT_FILM', '수제 악세서리 제작 과정 영상.', 25000, 'STANDARD', true, true, true, 6780, 1023, 423, 67, 'ACTIVE', now() - interval '198 days', now()),
((SELECT id FROM tbl_member WHERE email='demo08@bideo.kr'), '미니어처 공방', 'FILM', '정교한 미니어처 제작 타임랩스.', 35000, 'STANDARD', true, true, true, 9870, 1567, 678, 98, 'ACTIVE', now() - interval '170 days', now()),
((SELECT id FROM tbl_member WHERE email='demo08@bideo.kr'), '가죽 공예 입문', 'SHORT_FILM', '초보자를 위한 가죽 공예 튜토리얼.', 30000, 'STANDARD', true, true, true, 5430, 823, 345, 56, 'ACTIVE', now() - interval '140 days', now()),
((SELECT id FROM tbl_member WHERE email='demo08@bideo.kr'), '우드 카빙 아트', 'FILM', '나무 조각으로 만드는 예술 작품.', 45000, 'EXTENDED', true, true, true, 4320, 678, 267, 45, 'ACTIVE', now() - interval '110 days', now()),
((SELECT id FROM tbl_member WHERE email='demo08@bideo.kr'), '업사이클링 프로젝트', 'DOCUMENTARY', '버려진 물건의 새로운 변신.', 20000, 'STANDARD', false, true, true, 3210, 489, 198, 32, 'ACTIVE', now() - interval '80 days', now()),

-- 멤버 9 (영상작가현우) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo09@bideo.kr'), '미니멀 건축 디자인', 'DOCUMENTARY', '현대 미니멀 건축의 철학과 아름다움.', 75000, 'EXTENDED', true, true, true, 5670, 891, 367, 58, 'ACTIVE', now() - interval '98 days', now()),
((SELECT id FROM tbl_member WHERE email='demo09@bideo.kr'), '자연 다큐멘터리', 'DOCUMENTARY', '한국의 사계절을 담은 자연 다큐.', 90000, 'EXTENDED', true, true, true, 8900, 1345, 567, 89, 'ACTIVE', now() - interval '78 days', now()),
((SELECT id FROM tbl_member WHERE email='demo09@bideo.kr'), '도시 스케치', 'FILM', '도시의 일상을 스케치하듯 담은 영상.', 40000, 'STANDARD', true, true, true, 3450, 534, 213, 34, 'ACTIVE', now() - interval '58 days', now()),
((SELECT id FROM tbl_member WHERE email='demo09@bideo.kr'), '빗소리 ASMR 영상', 'FILM', '빗소리와 함께하는 힐링 영상.', 15000, 'STANDARD', false, true, true, 12340, 1890, 789, 123, 'ACTIVE', now() - interval '38 days', now()),
((SELECT id FROM tbl_member WHERE email='demo09@bideo.kr'), '타임랩스 서울', 'SHORT_FILM', '서울의 하루를 타임랩스로 담았습니다.', 55000, 'STANDARD', true, true, true, 6780, 1023, 423, 67, 'ACTIVE', now() - interval '18 days', now()),

-- 멤버 10 (크리에이터지아) 작품 5개
((SELECT id FROM tbl_member WHERE email='demo10@bideo.kr'), '감성 브이로그', 'FILM', '소소한 일상의 감성을 담은 브이로그.', 10000, 'STANDARD', true, true, true, 3450, 523, 198, 34, 'ACTIVE', now() - interval '28 days', now()),
((SELECT id FROM tbl_member WHERE email='demo10@bideo.kr'), '카페 투어 브이로그', 'FILM', '전국 감성 카페를 찾아 떠나는 여행.', 12000, 'STANDARD', true, true, true, 4560, 678, 267, 45, 'ACTIVE', now() - interval '22 days', now()),
((SELECT id FROM tbl_member WHERE email='demo10@bideo.kr'), '독립 영화 단편', 'SHORT_FILM', '사랑과 이별을 다룬 단편 영화.', 100000, 'EXTENDED', true, true, true, 2340, 389, 156, 28, 'ACTIVE', now() - interval '16 days', now()),
((SELECT id FROM tbl_member WHERE email='demo10@bideo.kr'), '뮤직비디오 비하인드', 'MUSIC_VIDEO', '뮤직비디오 촬영 비하인드 영상.', 50000, 'STANDARD', true, true, true, 5670, 891, 345, 56, 'ACTIVE', now() - interval '10 days', now()),
((SELECT id FROM tbl_member WHERE email='demo10@bideo.kr'), '졸업작품 메이킹필름', 'DOCUMENTARY', '영상학과 졸업작품 제작 과정.', 0, 'STANDARD', false, true, true, 1890, 289, 112, 19, 'ACTIVE', now() - interval '5 days', now());

-- ── 3. 작품 파일 50개 (썸네일) ──────────────────────────────
-- 각 작품에 1개씩 썸네일 파일 연결
-- 다양한 aspect ratio: 세로(400x560), 정방(400x400), 가로(400x280), 시네마(400x225) 등
INSERT INTO tbl_work_file (work_id, file_url, file_type, file_size, width, height, sort_order)
SELECT w.id,
       '/images/sample/work_' || lpad(row_number() OVER (ORDER BY w.created_datetime ASC)::text, 2, '0') || '.jpg',
       'IMAGE',
       (random() * 3000000 + 500000)::bigint,
       400,
       CASE (row_number() OVER (ORDER BY w.created_datetime ASC) % 10)
           WHEN 1 THEN 560   -- 세로 tall
           WHEN 2 THEN 400   -- 정방형
           WHEN 3 THEN 280   -- 가로 wide
           WHEN 4 THEN 520   -- 세로
           WHEN 5 THEN 300   -- 가로
           WHEN 6 THEN 480   -- 약간 세로
           WHEN 7 THEN 225   -- 시네마 16:9
           WHEN 8 THEN 600   -- 세로 tall
           WHEN 9 THEN 350   -- 약간 가로
           ELSE 450          -- 약간 세로
       END,
       0
FROM tbl_work w
WHERE w.member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
  AND w.status = 'ACTIVE';

-- ── 4. 예술관 5개 ──────────────────────────────────────────
INSERT INTO tbl_gallery (member_id, title, description, cover_image, allow_comment, show_similar, work_count, like_count, comment_count, view_count, status, created_datetime, updated_datetime)
VALUES
((SELECT id FROM tbl_member WHERE email='demo01@bideo.kr'), '디자인 영감 컬렉션', '공간, 타이포그래피, 브랜드 디자인의 영감을 모은 예술관입니다.', '/images/sample/gallery_cover_01.jpg', true, true, 5, 345, 23, 4567, 'EXHIBITING', now() - interval '85 days', now()),
((SELECT id FROM tbl_member WHERE email='demo02@bideo.kr'), '세계 여행 기록', '전 세계를 여행하며 담은 영상들의 컬렉션.', '/images/sample/gallery_cover_02.jpg', true, true, 5, 891, 67, 8923, 'EXHIBITING', now() - interval '80 days', now()),
((SELECT id FROM tbl_member WHERE email='demo03@bideo.kr'), '요리의 예술', '음식을 예술로 승화시킨 요리 영상 컬렉션.', '/images/sample/gallery_cover_03.jpg', true, true, 5, 567, 45, 6789, 'EXHIBITING', now() - interval '75 days', now()),
((SELECT id FROM tbl_member WHERE email='demo04@bideo.kr'), '빛의 서사', '빛과 그림자로 이야기하는 시네마토그래피 컬렉션.', '/images/sample/gallery_cover_04.jpg', true, true, 5, 1234, 89, 12345, 'EXHIBITING', now() - interval '115 days', now()),
((SELECT id FROM tbl_member WHERE email='demo05@bideo.kr'), '모션 아트 갤러리', '실험적 모션 그래픽과 애니메이션 작품들.', '/images/sample/gallery_cover_05.jpg', true, true, 5, 2345, 123, 15678, 'EXHIBITING', now() - interval '145 days', now()),
((SELECT id FROM tbl_member WHERE email='demo01@bideo.kr'), '디자인 영감 컬렉션', '공간, 타이포그래피, 브랜드 디자인의 영감을 모은 예술관입니다.', '/images/sample/gallery_cover_01.jpg', true, true, 5, 345, 23, 4567, 'EXHIBITING', now() - interval '85 days', now()),
((SELECT id FROM tbl_member WHERE email='demo02@bideo.kr'), '세계 여행 기록', '전 세계를 여행하며 담은 영상들의 컬렉션.', '/images/sample/gallery_cover_02.jpg', true, true, 5, 891, 67, 8923, 'EXHIBITING', now() - interval '80 days', now()),
((SELECT id FROM tbl_member WHERE email='demo03@bideo.kr'), '요리의 예술', '음식을 예술로 승화시킨 요리 영상 컬렉션.', '/images/sample/gallery_cover_03.jpg', true, true, 5, 567, 45, 6789, 'EXHIBITING', now() - interval '75 days', now()),
((SELECT id FROM tbl_member WHERE email='demo04@bideo.kr'), '빛의 서사', '빛과 그림자로 이야기하는 시네마토그래피 컬렉션.', '/images/sample/gallery_cover_04.jpg', true, true, 5, 1234, 89, 12345, 'EXHIBITING', now() - interval '115 days', now()),
((SELECT id FROM tbl_member WHERE email='demo05@bideo.kr'), '모션 아트 갤러리', '실험적 모션 그래픽과 애니메이션 작품들.', '/images/sample/gallery_cover_05.jpg', true, true, 5, 2345, 123, 15678, 'EXHIBITING', now() - interval '145 days', now()),
((SELECT id FROM tbl_member WHERE email='demo01@bideo.kr'), '디자인 영감 컬렉션', '공간, 타이포그래피, 브랜드 디자인의 영감을 모은 예술관입니다.', '/images/sample/gallery_cover_01.jpg', true, true, 5, 345, 23, 4567, 'EXHIBITING', now() - interval '85 days', now()),
((SELECT id FROM tbl_member WHERE email='demo02@bideo.kr'), '세계 여행 기록', '전 세계를 여행하며 담은 영상들의 컬렉션.', '/images/sample/gallery_cover_02.jpg', true, true, 5, 891, 67, 8923, 'EXHIBITING', now() - interval '80 days', now()),
((SELECT id FROM tbl_member WHERE email='demo03@bideo.kr'), '요리의 예술', '음식을 예술로 승화시킨 요리 영상 컬렉션.', '/images/sample/gallery_cover_03.jpg', true, true, 5, 567, 45, 6789, 'EXHIBITING', now() - interval '75 days', now()),
((SELECT id FROM tbl_member WHERE email='demo04@bideo.kr'), '빛의 서사', '빛과 그림자로 이야기하는 시네마토그래피 컬렉션.', '/images/sample/gallery_cover_04.jpg', true, true, 5, 1234, 89, 12345, 'EXHIBITING', now() - interval '115 days', now()),
((SELECT id FROM tbl_member WHERE email='demo05@bideo.kr'), '모션 아트 갤러리', '실험적 모션 그래픽과 애니메이션 작품들.', '/images/sample/gallery_cover_05.jpg', true, true, 5, 2345, 123, 15678, 'EXHIBITING', now() - interval '145 days', now());

-- ── 5. 예술관-작품 연결 ──────────────────────────────────────
-- 각 예술관에 해당 멤버의 작품 5개씩 연결
INSERT INTO tbl_gallery_work (gallery_id, work_id, sort_order, added_at)
SELECT g.id, w.id, row_number() OVER (PARTITION BY g.id ORDER BY w.created_datetime ASC), now()
FROM tbl_gallery g
JOIN tbl_member m ON g.member_id = m.id
JOIN tbl_work w ON w.member_id = m.id AND w.status = 'ACTIVE'
WHERE m.email IN ('demo01@bideo.kr', 'demo02@bideo.kr', 'demo03@bideo.kr', 'demo04@bideo.kr', 'demo05@bideo.kr')
  AND g.status = 'EXHIBITING';

-- ── 완료 ──────────────────────────────────────────────────
-- SELECT '더미 데이터 삽입 완료' AS result;
-- SELECT count(*) AS member_count FROM tbl_member WHERE email LIKE 'demo%@bideo.kr';
-- SELECT count(*) AS work_count FROM tbl_work WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr');
-- SELECT count(*) AS gallery_count FROM tbl_gallery WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr');
