-- ----------------------------------------------------------
-- Bideo 전체 스키마 실행 스크립트
-- 사용법: psql -U bideo -d bideo -f 99_run_all.sql
-- ----------------------------------------------------------

\encoding UTF8
\set ON_ERROR_STOP on
\ir tbl_member.sql
\ir tbl_tag.sql
\ir tbl_badge.sql
\ir tbl_message_room.sql
\ir tbl_faq.sql
\ir tbl_oauth.sql
\ir tbl_member_tag.sql
\ir tbl_member_badge.sql
\ir tbl_notification_setting.sql
\ir tbl_work.sql
\ir tbl_work_view.sql
\ir tbl_follow.sql
\ir tbl_block.sql
\ir tbl_card.sql
\ir tbl_search_history.sql
\ir tbl_inquiry.sql
\ir tbl_work_file.sql
\ir tbl_work_tag.sql
\ir tbl_gallery.sql
\ir tbl_contest.sql
\ir tbl_work_like.sql
\ir tbl_gallery_like.sql
\ir tbl_bookmark.sql
\ir tbl_comment.sql
\ir tbl_comment_like.sql
\ir tbl_hide.sql
\ir tbl_report.sql
\ir tbl_member_restriction.sql
\ir tbl_notification.sql
\ir tbl_message_room_member.sql
\ir tbl_message.sql
\ir tbl_message_like.sql
\ir tbl_display_control.sql
\ir tbl_curator_setting.sql
\ir tbl_gallery_tag.sql
\ir tbl_gallery_work.sql
\ir tbl_contest_tag.sql
\ir tbl_contest_entry.sql
\ir tbl_auction.sql
\ir tbl_bid.sql
\ir tbl_auction_wishlist.sql
\ir tbl_order.sql
\ir tbl_payment.sql
\ir tbl_settlement.sql
\ir tbl_settlement_deduction.sql
\ir tbl_withdrawal_request.sql
\ir seed_badge.sql
\ir tbl_like.sql
\ir tbl_message_like


-- ----------------------------------------------------------
-- tbl_message 누락 컬럼 추가 (기존 DB 마이그레이션용)
-- ----------------------------------------------------------
ALTER TABLE tbl_message ADD COLUMN IF NOT EXISTS updated_datetime TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE tbl_message ADD COLUMN IF NOT EXISTS deleted_datetime TIMESTAMP NULL;
ALTER TABLE tbl_message ADD COLUMN IF NOT EXISTS reply_to_message_id BIGINT NULL REFERENCES tbl_message(id);
ALTER TABLE tbl_message ADD COLUMN IF NOT EXISTS like_count INT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_msg_reply ON tbl_message (reply_to_message_id);

-- tbl_message_like 테이블 생성 (없을 경우)
CREATE TABLE IF NOT EXISTS tbl_message_like (
    id               bigint generated always as identity primary key,
    message_id       bigint    not null,
    member_id        bigint    not null,
    created_datetime timestamp not null default now(),
    constraint uk_message_like unique (message_id, member_id),
    constraint fk_message_like_message foreign key (message_id) references tbl_message (id),
    constraint fk_message_like_member foreign key (member_id) references tbl_member (id)
);
CREATE INDEX IF NOT EXISTS idx_message_like_message ON tbl_message_like (message_id);
CREATE INDEX IF NOT EXISTS idx_message_like_member ON tbl_message_like (member_id);
