-- =============================================================
-- Admin 기능 DB 셋업 스크립트
-- 실행: psql -U bideo -d bideo -f admin_setup.sql
-- =============================================================

\encoding UTF8

-- =============================================================
-- 1. tbl_inquiry: CHECK 제약조건 추가 (이미 테이블 존재 시)
-- =============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'chk_inquiry_status' AND table_name = 'tbl_inquiry'
    ) THEN
        ALTER TABLE tbl_inquiry
            ADD CONSTRAINT chk_inquiry_status CHECK (status IN ('PENDING', 'ANSWERED', 'CLOSED'));
    END IF;
END $$;

-- =============================================================
-- 2. tbl_report: CHECK 제약조건 추가 (이미 테이블 존재 시)
-- =============================================================
-- report_message_admin 컬럼이 남아있으면 삭제
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tbl_report' AND column_name = 'report_message_admin'
    ) THEN
        ALTER TABLE tbl_report DROP COLUMN report_message_admin;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'chk_report_target_type' AND table_name = 'tbl_report'
    ) THEN
        ALTER TABLE tbl_report
            ADD CONSTRAINT chk_report_target_type CHECK (target_type IN ('WORK', 'MEMBER', 'COMMENT', 'GALLERY'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'chk_report_reason' AND table_name = 'tbl_report'
    ) THEN
        ALTER TABLE tbl_report
            ADD CONSTRAINT chk_report_reason CHECK (reason IN ('SENSITIVE', 'IMPERSONATION', 'HARASSMENT', 'COPYRIGHT'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'chk_report_status' AND table_name = 'tbl_report'
    ) THEN
        ALTER TABLE tbl_report
            ADD CONSTRAINT chk_report_status CHECK (status IN ('PENDING', 'REVIEWING', 'RESOLVED', 'CANCELLED'));
    END IF;
END $$;

-- =============================================================
-- 3. tbl_member_restriction: 신규 테이블 생성
-- =============================================================
CREATE TABLE IF NOT EXISTS tbl_member_restriction
(
    id                     bigint generated always as identity primary key,
    member_id              bigint       not null,
    report_id              bigint       null,
    restriction_type       varchar(20)  not null,
    reason                 text         not null,
    previous_member_status varchar(20)  not null,
    status                 varchar(20)  not null default 'ACTIVE',
    start_datetime         timestamp    not null default now(),
    end_datetime           timestamp    null,
    released_datetime      timestamp    null,
    created_datetime       timestamp    not null default now(),
    updated_datetime       timestamp    not null default now(),

    constraint fk_member_restriction_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_member_restriction_report foreign key (report_id)
        references tbl_report (id),
    constraint chk_member_restriction_type
        check (restriction_type in ('BLOCK', 'LIMIT')),
    constraint chk_member_restriction_status
        check (status in ('ACTIVE', 'RELEASED', 'EXPIRED')),
    constraint chk_member_restriction_end
        check (
            (restriction_type = 'BLOCK' and end_datetime is null)
            or (restriction_type = 'LIMIT' and end_datetime is not null)
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_member_restriction_active
    ON tbl_member_restriction (member_id)
    WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_member_restriction_status
    ON tbl_member_restriction (status, created_datetime desc);

CREATE INDEX IF NOT EXISTS idx_member_restriction_type
    ON tbl_member_restriction (restriction_type, created_datetime desc);

-- =============================================================
-- 4. 더미 데이터
-- =============================================================

-- 4-1. 문의 더미 (tbl_member에 회원이 있어야 함)
INSERT INTO tbl_inquiry (member_id, category, content, reply, status, created_datetime, updated_datetime)
SELECT
    m.id,
    cat.category,
    cat.content,
    cat.reply,
    cat.status,
    now() - (cat.days || ' days')::interval,
    now() - (cat.days || ' days')::interval
FROM tbl_member m
CROSS JOIN (VALUES
    ('계정',    '비밀번호를 변경하고 싶은데 방법을 모르겠어요.',           NULL,                                    'PENDING',  3),
    ('결제',    '작품 구매 후 결제 취소가 가능한가요?',                    '결제 후 24시간 이내 취소 가능합니다.',     'ANSWERED', 5),
    ('서비스',  '갤러리 업로드 시 파일 용량 제한이 있나요?',               '20MB 이하의 이미지 파일만 업로드됩니다.',  'ANSWERED', 7),
    ('계정',    '회원 탈퇴를 하려면 어떻게 해야 하나요?',                  NULL,                                    'PENDING',  1),
    ('기타',    '앱에서 알림이 오지 않습니다. 확인 부탁드립니다.',          NULL,                                    'PENDING',  2)
) AS cat(category, content, reply, status, days)
WHERE m.id = (SELECT id FROM tbl_member ORDER BY id LIMIT 1)
ON CONFLICT DO NOTHING;

-- 4-2. 신고 더미
INSERT INTO tbl_report (reporter_id, target_type, target_id, reason, detail, status, created_datetime, updated_datetime)
SELECT
    m.id,
    r.target_type,
    r.target_id,
    r.reason,
    r.detail,
    r.status,
    now() - (r.days || ' days')::interval,
    now() - (r.days || ' days')::interval
FROM tbl_member m
CROSS JOIN (VALUES
    ('WORK',    1, 'SENSITIVE',      '선정적인 이미지가 포함되어 있습니다.',         'PENDING',    2),
    ('MEMBER',  2, 'IMPERSONATION',  '타인의 프로필 사진을 도용하고 있습니다.',      'REVIEWING',  4),
    ('COMMENT', 3, 'HARASSMENT',     '욕설 및 비하 발언이 포함되어 있습니다.',       'PENDING',    1),
    ('GALLERY', 1, 'COPYRIGHT',      '허락 없이 제 작품을 갤러리에 올렸습니다.',     'RESOLVED',   6),
    ('WORK',    2, 'SENSITIVE',      NULL,                                          'CANCELLED',  8)
) AS r(target_type, target_id, reason, detail, status, days)
WHERE m.id = (SELECT id FROM tbl_member ORDER BY id LIMIT 1)
ON CONFLICT DO NOTHING;

-- 4-3. 이용 제한 더미 (회원 2명 이상 필요)
DO $$
DECLARE
    v_member1 bigint;
    v_member2 bigint;
    v_member3 bigint;
BEGIN
    SELECT id INTO v_member1 FROM tbl_member ORDER BY id LIMIT 1;
    SELECT id INTO v_member2 FROM tbl_member ORDER BY id OFFSET 1 LIMIT 1;
    SELECT id INTO v_member3 FROM tbl_member ORDER BY id OFFSET 2 LIMIT 1;

    IF v_member1 IS NULL THEN
        RAISE NOTICE '회원 데이터가 없어 제한 더미를 건너뜁니다.';
        RETURN;
    END IF;

    -- 차단 (영구)
    IF v_member2 IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM tbl_member_restriction WHERE member_id = v_member2 AND status = 'ACTIVE'
    ) THEN
        INSERT INTO tbl_member_restriction (member_id, restriction_type, reason, previous_member_status, end_datetime, created_datetime, updated_datetime)
        VALUES (v_member2, 'BLOCK', '반복적인 욕설 및 커뮤니티 규정 위반', 'ACTIVE', NULL, now() - interval '3 days', now() - interval '3 days');

        UPDATE tbl_member SET status = 'BANNED' WHERE id = v_member2;
    END IF;

    -- 기간 제한 (7일)
    IF v_member3 IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM tbl_member_restriction WHERE member_id = v_member3 AND status = 'ACTIVE'
    ) THEN
        INSERT INTO tbl_member_restriction (member_id, restriction_type, reason, previous_member_status, end_datetime, created_datetime, updated_datetime)
        VALUES (v_member3, 'LIMIT', '저작권 침해 콘텐츠 업로드', 'ACTIVE', now() + interval '4 days', now() - interval '3 days', now() - interval '3 days');

        UPDATE tbl_member SET status = 'SUSPENDED' WHERE id = v_member3;
    END IF;
END $$;

-- 완료
SELECT '=== admin_setup 완료 ===' AS result;
SELECT 'tbl_inquiry:            ' || count(*) || '건' FROM tbl_inquiry
UNION ALL
SELECT 'tbl_report:             ' || count(*) || '건' FROM tbl_report
UNION ALL
SELECT 'tbl_member_restriction: ' || count(*) || '건' FROM tbl_member_restriction;
