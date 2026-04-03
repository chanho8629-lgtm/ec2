-- =============================================
-- 알림 더미 데이터 INSERT
-- =============================================
-- 사용법: 아래 member_id(1)를 본인 계정의 id로 변경 후 실행
-- sender_id도 실제 존재하는 member id로 변경 필요
-- (tbl_member에서 SELECT id, nickname FROM tbl_member 로 확인)

-- 좋아요 알림
INSERT INTO tbl_notification (member_id, sender_id, noti_type, target_type, target_id, message)
VALUES (1, 2, 'LIKE', 'WORK', 10, '님이 당신의 작품에 좋아요를 눌렀습니다.');

-- 댓글 알림
INSERT INTO tbl_notification (member_id, sender_id, noti_type, target_type, target_id, message)
VALUES (1, 3, 'COMMENT', 'WORK', 10, '님이 당신의 작품에 댓글을 달았습니다.');

-- 팔로우 알림
INSERT INTO tbl_notification (member_id, sender_id, noti_type, target_type, target_id, message)
VALUES (1, 4, 'FOLLOW', NULL, NULL, '님이 당신을 팔로우했습니다.');

-- 경매 종료 알림 (시스템 - sender_id NULL)
INSERT INTO tbl_notification (member_id, sender_id, noti_type, target_type, target_id, message)
VALUES (1, NULL, 'AUCTION_END', 'AUCTION', 5, '경매가 종료되었습니다. 결과를 확인하세요.');

-- 입찰 알림
INSERT INTO tbl_notification (member_id, sender_id, noti_type, target_type, target_id, message)
VALUES (1, 2, 'BID', 'AUCTION', 5, '님이 경매에 입찰하였습니다.');

-- 정산 완료 알림 (시스템)
INSERT INTO tbl_notification (member_id, sender_id, noti_type, target_type, target_id, message)
VALUES (1, NULL, 'SETTLEMENT', 'PAYMENT', 3, '정산이 완료되었습니다.');
