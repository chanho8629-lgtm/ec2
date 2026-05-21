\encoding UTF8

-- 내가 올린 실제 작품([DUMMY] 제외, ACTIVE 상태)에 좋아요/조회수/댓글/태그 더미 데이터 추가
-- 중복 실행해도 on conflict do nothing 으로 안전

do $$
declare
    dummy_member_count int;
    work_row record;
    member_row record;
    tag_row record;
    comment_contents text[] := array[
        '정말 멋진 작품이에요!',
        '색감이 너무 예쁘네요 👍',
        '이런 스타일 좋아요',
        '퀄리티가 장난 아니네요',
        '어떻게 만드셨어요? 대단해요',
        '구매하고 싶네요',
        '작업물이 정말 인상적이에요',
        '트렌디한 느낌이 좋아요',
        '마케팅에 활용하고 싶어요',
        '영상미가 살아있어요',
        '아트워크가 너무 좋아요',
        '이런 감성 최고예요',
        '구성이 깔끔하고 세련됐어요',
        '뭔가 눈에 확 들어오네요',
        '작품에서 전문성이 느껴져요',
        '브랜드 광고에 딱 맞을 것 같아요',
        '독창적인 아이디어네요',
        '완성도가 높아요 대박',
        '이 스타일로 시리즈 만들어 주세요!',
        '팔로우 했어요 앞으로도 기대할게요'
    ];
    i int;
    chosen_content text;
    like_count_val int;
    view_add int;
    comment_count_val int;
begin
    select count(*) into dummy_member_count
    from tbl_member
    where email ~ E'^test([1-9][0-9]?|100)@bideo\\.com$';

    if dummy_member_count = 0 then
        raise notice '더미 멤버 없음. dummy.sql 먼저 실행 필요.';
        return;
    end if;

    -- 실제 올린 작품 순회 (DUMMY 제외, ACTIVE)
    for work_row in
        select id, member_id,
               5 + (abs(hashtext(id::text || ':like')) % 46) as target_likes,
               3 + (abs(hashtext(id::text || ':comment')) % 13) as target_comments,
               200 + (abs(hashtext(id::text || ':view')) % 4801) as view_add
        from tbl_work
        where status = 'ACTIVE'
          and deleted_datetime is null
          and title not like '[DUMMY]%'
    loop

        -- 1. 조회수 업데이트
        update tbl_work
        set view_count = view_count + work_row.view_add,
            updated_datetime = now()
        where id = work_row.id;

        -- 2. 좋아요 (더미 멤버 중 target_likes명이 좋아요)
        i := 0;
        for member_row in
            select id
            from tbl_member
            where email ~ E'^test([1-9][0-9]?|100)@bideo\\.com$'
              and id != work_row.member_id
            order by abs(hashtext(work_row.id::text || id::text))
            limit work_row.target_likes
        loop
            insert into tbl_like (member_id, target_type, target_id, created_datetime)
            values (member_row.id, 'WORK', work_row.id,
                    now() - (abs(hashtext(member_row.id::text || work_row.id::text)) % 720 * interval '1 hour'))
            on conflict (member_id, target_type, target_id) do nothing;
            i := i + 1;
        end loop;

        -- like_count 동기화
        update tbl_work
        set like_count = (
            select count(*) from tbl_like
            where target_type = 'WORK' and target_id = work_row.id
        ),
            updated_datetime = now()
        where id = work_row.id;

        -- 3. 댓글 (더미 멤버 중 target_comments명이 댓글)
        i := 0;
        for member_row in
            select id
            from tbl_member
            where email ~ E'^test([1-9][0-9]?|100)@bideo\\.com$'
              and id != work_row.member_id
            order by abs(hashtext(work_row.id::text || ':c' || id::text))
            limit work_row.target_comments
        loop
            chosen_content := comment_contents[1 + (abs(hashtext(member_row.id::text || work_row.id::text || i::text)) % array_length(comment_contents, 1))];
            insert into tbl_comment (member_id, target_type, target_id, content, created_datetime, updated_datetime)
            values (member_row.id, 'WORK', work_row.id, chosen_content,
                    now() - (abs(hashtext(member_row.id::text || work_row.id::text)) % 480 * interval '1 hour'),
                    now())
            on conflict do nothing;
            i := i + 1;
        end loop;

        -- comment_count 동기화
        update tbl_work
        set comment_count = (
            select count(*) from tbl_comment
            where target_type = 'WORK' and target_id = work_row.id
              and deleted_datetime is null
        ),
            updated_datetime = now()
        where id = work_row.id;

        -- 4. 태그 매핑 (작품당 4~8개)
        for tag_row in
            select id
            from tbl_tag
            order by abs(hashtext(work_row.id::text || ':tag' || id::text))
            limit 4 + (abs(hashtext(work_row.id::text || ':tagcount')) % 5)
        loop
            insert into tbl_work_tag (work_id, tag_id)
            values (work_row.id, tag_row.id)
            on conflict (work_id, tag_id) do nothing;
        end loop;

        -- tag_count 동기화
        update tbl_work
        set tag_count = (select count(*) from tbl_work_tag where work_id = work_row.id),
            updated_datetime = now()
        where id = work_row.id;

        -- 5. engagement_score 업데이트
        update tbl_work
        set engagement_score = like_count + comment_count + save_count,
            reaction_score    = like_count + comment_count + save_count
        where id = work_row.id;

    end loop;

    raise notice '작품 인터랙션 더미 데이터 삽입 완료';
end;
$$;
