-- ============================================================
-- BIDEO 더미 데이터 일괄 정리
-- 모든 파일은 S3에 저장되는 정책으로 변경되어, 로컬 경로(/images/sample/...,
-- /uploads/...)를 가리키는 더미 데이터를 삭제한다.
-- PostgreSQL용
-- ============================================================
-- 실행 전 백업 권장
-- 사용법: psql -d <DB> -f cleanup_dummy_data.sql

-- demo 멤버가 가진 작품 ID 목록과, 로컬 경로를 가진 파일이 연결된 작품 ID 목록을 한 번에 끊는다.
WITH dummy_members AS (
    SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr'
),
local_path_works AS (
    SELECT DISTINCT work_id
    FROM tbl_work_file
    WHERE file_url LIKE '/images/%'
       OR file_url LIKE '/uploads/%'
       OR file_url LIKE '/static/%'
),
target_works AS (
    SELECT id FROM tbl_work WHERE member_id IN (SELECT id FROM dummy_members)
    UNION
    SELECT work_id AS id FROM local_path_works
),
target_galleries AS (
    SELECT id FROM tbl_gallery WHERE member_id IN (SELECT id FROM dummy_members)
       OR cover_image LIKE '/images/%'
       OR cover_image LIKE '/uploads/%'
)
DELETE FROM tbl_gallery_work
WHERE work_id IN (SELECT id FROM target_works)
   OR gallery_id IN (SELECT id FROM target_galleries);

-- 작품 파일/태그/좋아요/조회/북마크/댓글/경매 등 작품 의존 데이터 정리
DELETE FROM tbl_work_file WHERE work_id IN (
    SELECT id FROM tbl_work WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
);
DELETE FROM tbl_work_file WHERE file_url LIKE '/images/%' OR file_url LIKE '/uploads/%' OR file_url LIKE '/static/%';

DELETE FROM tbl_work_tag WHERE work_id IN (
    SELECT id FROM tbl_work WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
);

DELETE FROM tbl_work_like WHERE work_id IN (
    SELECT id FROM tbl_work WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
);

DELETE FROM tbl_work_view WHERE work_id IN (
    SELECT id FROM tbl_work WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
);

DELETE FROM tbl_bookmark WHERE target_type = 'WORK' AND target_id IN (
    SELECT id FROM tbl_work WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
);

DELETE FROM tbl_comment WHERE target_type = 'WORK' AND target_id IN (
    SELECT id FROM tbl_work WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
);

DELETE FROM tbl_auction WHERE work_id IN (
    SELECT id FROM tbl_work WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
);

-- 작품 본체 삭제
DELETE FROM tbl_work WHERE member_id IN (
    SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr'
);

-- 예술관(갤러리) 정리 — demo 멤버 소유 + 로컬 경로 커버 이미지
DELETE FROM tbl_gallery_tag WHERE gallery_id IN (
    SELECT id FROM tbl_gallery
    WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
       OR cover_image LIKE '/images/%'
       OR cover_image LIKE '/uploads/%'
);
DELETE FROM tbl_gallery_like WHERE gallery_id IN (
    SELECT id FROM tbl_gallery
    WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
       OR cover_image LIKE '/images/%'
       OR cover_image LIKE '/uploads/%'
);
DELETE FROM tbl_gallery
WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
   OR cover_image LIKE '/images/%'
   OR cover_image LIKE '/uploads/%';

-- 알림 더미(테스트용 INSERT) 정리 — demo 멤버 관련
DELETE FROM tbl_notification
WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
   OR sender_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr');

-- 팔로우/차단 등 멤버 의존 관계 정리
DELETE FROM tbl_follow
WHERE follower_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
   OR following_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr');

DELETE FROM tbl_block
WHERE blocker_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
   OR blocked_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr');

DELETE FROM tbl_member_tag WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr');
DELETE FROM tbl_member_badge WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr');

-- 메시지 관련 의존 데이터 정리 (demo 멤버가 참여한 룸/메시지)
DELETE FROM tbl_message_like
WHERE message_id IN (
    SELECT id FROM tbl_message
    WHERE sender_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
);
DELETE FROM tbl_message
WHERE sender_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
   OR message_room_id IN (
        SELECT message_room_id FROM tbl_message_room_member
        WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr')
   );
DELETE FROM tbl_message_room_member
WHERE member_id IN (SELECT id FROM tbl_member WHERE email LIKE 'demo%@bideo.kr');
DELETE FROM tbl_message_room
WHERE id IN (
    SELECT id FROM tbl_message_room
    WHERE NOT EXISTS (
        SELECT 1 FROM tbl_message_room_member rm WHERE rm.message_room_id = tbl_message_room.id
    )
);

-- 마지막으로 demo 멤버 본체 삭제 — 프로필 이미지가 로컬 경로인 멤버도 함께 정리
UPDATE tbl_member
SET profile_image = NULL
WHERE profile_image LIKE '/images/%'
   OR profile_image LIKE '/uploads/%';

UPDATE tbl_member
SET banner_image = NULL
WHERE banner_image LIKE '/images/%'
   OR banner_image LIKE '/uploads/%';

DELETE FROM tbl_member WHERE email LIKE 'demo%@bideo.kr';

-- ── 검증 쿼리 ─────────────────────────────────────────────
-- SELECT count(*) AS remaining_demo_members FROM tbl_member WHERE email LIKE 'demo%@bideo.kr';
-- SELECT count(*) AS remaining_local_files FROM tbl_work_file WHERE file_url LIKE '/images/%' OR file_url LIKE '/uploads/%';
-- SELECT count(*) AS remaining_local_galleries FROM tbl_gallery WHERE cover_image LIKE '/images/%' OR cover_image LIKE '/uploads/%';
