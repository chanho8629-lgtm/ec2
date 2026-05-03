-- =================================================================
-- 사진(이미지 전용) 작품 더미 데이터
-- 영상 작품과 비교 / 작품 상세에서 <img> 분기 검증용.
--
-- 사전 조건: seed_admin_dummy.sql 가 먼저 실행돼 회원/작품 시드가 있어야 함.
-- 실행: psql -U bideo -d bideo -f seed_admin_photo_works.sql
--
-- 멱등: 같은 제목(QA-사진-XXX)을 항상 지우고 다시 넣는다.
-- =================================================================

\echo '=> Removing previous QA-사진 dummy rows (idempotent)'
delete from tbl_work_file
 where work_id in (select id from tbl_work where title like 'QA-사진-%');
delete from tbl_work
 where title like 'QA-사진-%';

\echo '=> Inserting 15 photo-only works (NO video file)'
with new_works as (
    insert into tbl_work (
        member_id, title, category, description, price, license_type,
        is_tradable, thumbnail, view_count, like_count, save_count, status,
        created_datetime
    )
    select
        ((i - 1) % 50) + 2,                                                    -- 작가 50명에 분배
        'QA-사진-' || lpad(i::text, 3, '0'),                                  -- 식별 가능한 제목
        'PHOTO',
        'QA 사진 더미 #' || i || ' — 영상 없이 썸네일만 있는 작품',
        80000 + (i * 1500),
        case (i % 3) when 0 then 'PERSONAL' when 1 then 'COMMERCIAL' else 'EXCLUSIVE' end,
        true,
        'https://picsum.photos/seed/qa-photo-' || i || '/640/360',            -- 리스트용 썸네일
        (i * 19) % 4000,
        (i * 4)  % 400,
        (i * 2)  % 150,
        case when i % 12 = 0 then 'HIDDEN' else 'ACTIVE' end,
        now() - ((i * 3 + 2) || ' hour')::interval
    from generate_series(1, 15) as g(i)
    returning id, title
)
insert into tbl_work_file (work_id, file_url, file_type, file_size, width, height, sort_order)
select w.id,
       'https://picsum.photos/seed/qa-photo-' || split_part(w.title, '-', 3) || '/1920/1080',
       'THUMBNAIL', 204800, 1920, 1080, 0
from new_works w;

\echo '=> Done. 검증:'
\echo '   - 작품관리 list 에서 QA-사진-001 ~ QA-사진-015 행이 보이고, 미리보기 셀에 <img> 가 그려지는지'
\echo '   - 상세 진입 시 <video> 가 숨겨지고 <img> 만 노출되는지'
select id, title, category, status
  from tbl_work
 where title like 'QA-사진-%'
 order by id;
