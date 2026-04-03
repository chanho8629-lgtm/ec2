-- ----------------------------------------------------------
-- 42. 뱃지 시드 데이터
-- ----------------------------------------------------------
INSERT INTO tbl_badge (badge_key, badge_name, image_file, description) VALUES
    ('FIRST_WORK',      '첫 작품',       'badge_first_work.svg',      '첫 번째 작품을 업로드하면 획득'),
    ('WORK_10',         '작품 10개',     'badge_work_10.svg',         '작품을 10개 이상 업로드하면 획득'),
    ('WORK_50',         '작품 50개',     'badge_work_50.svg',         '작품을 50개 이상 업로드하면 획득'),
    ('FIRST_SALE',      '첫 거래',       'badge_first_sale.svg',      '첫 번째 작품 판매 시 획득'),
    ('FIRST_AUCTION',   '첫 경매',       'badge_first_auction.svg',   '첫 번째 경매 등록 시 획득'),
    ('GALLERY_CREATOR', '예술관 개설',    'badge_gallery_creator.svg', '첫 번째 예술관을 개설하면 획득'),
    ('CONTEST_WINNER',  '콘테스트 수상',  'badge_contest_winner.svg',  '콘테스트에서 수상하면 획득'),
    ('FOLLOWER_100',    '팔로워 100',    'badge_follower_100.svg',    '팔로워 100명 달성 시 획득'),
    ('EARLY_ADOPTER',   '얼리 어답터',    'badge_early_adopter.svg',   '서비스 초기 가입자에게 부여');
