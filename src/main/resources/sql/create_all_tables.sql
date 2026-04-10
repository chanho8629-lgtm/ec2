-- ==========================================================
-- Bideo 전체 테이블 생성 스크립트 (단일 파일)
-- 생성일: 2026-04-06
-- ==========================================================
\encoding UTF8

-- psql -U bideo -d bideo -f create_all_tables.sql
-- ----------------------------------------------------------
-- 1. 회원 (tbl_member)
-- ----------------------------------------------------------
drop table if exists tbl_member cascade;

create table tbl_member
(
    id                  bigint generated always as identity primary key,
    email               varchar(255) not null,
    password            varchar(255) null,
    nickname            varchar(255) not null,
    real_name           varchar(255) null,
    birth_date          date         null,
    bio                 varchar(255) null,
    profile_image       varchar(255) null,
    role                varchar(255) not null default 'USER',
    creator_verified    boolean      not null default false,
    seller_verified     boolean      not null default false,
    creator_tier        varchar(255) not null default 'BASIC',
    follower_count      int          not null default 0,
    following_count     int          not null default 0,
    gallery_count       int          not null default 0,
    phone_number        varchar(255) null,
    last_login_datetime timestamp    null,
    status              varchar(255) not null default 'ACTIVE',
    created_datetime    timestamp    not null default now(),
    updated_datetime    timestamp    not null default now(),
    deleted_datetime    timestamp    null,

    constraint uk_member_email unique (email),
    constraint uk_member_nickname unique (nickname),
    constraint chk_member_status check (status in ('ACTIVE', 'SUSPENDED', 'BANNED'))
);

comment on table tbl_member is '회원';
comment on column tbl_member.id is '회원 번호 (PK)';
comment on column tbl_member.email is '이메일 (로그인 + 아이디찾기)';
comment on column tbl_member.password is '비밀번호 (bcrypt, 소셜전용은 NULL)';
comment on column tbl_member.nickname is '닉네임';
comment on column tbl_member.real_name is '실명';
comment on column tbl_member.birth_date is '생년월일';
comment on column tbl_member.bio is '자기소개';
comment on column tbl_member.profile_image is '프로필 이미지 URL';
comment on column tbl_member.role is '권한 (USER / ADMIN)';
comment on column tbl_member.creator_verified is '크리에이터 인증 여부';
comment on column tbl_member.seller_verified is '검증된 셀러 여부';
comment on column tbl_member.creator_tier is '크리에이터 등급 (BASIC / PREMIUM)';
comment on column tbl_member.follower_count is '팔로워 수 (비정규화)';
comment on column tbl_member.following_count is '팔로잉 수 (비정규화)';
comment on column tbl_member.gallery_count is '예술관 수 (비정규화)';
comment on column tbl_member.phone_number is '연락처';
comment on column tbl_member.last_login_datetime is '최종 로그인 일시';
comment on column tbl_member.status is '계정 상태 (ACTIVE/SUSPENDED/BANNED)';
comment on column tbl_member.deleted_datetime is '탈퇴 일시 (soft delete)';

select * from tbl_member;

-- ----------------------------------------------------------
-- 2. 태그 (tbl_tag)
-- ----------------------------------------------------------
drop table if exists tbl_tag cascade;

create table tbl_tag (
    id       bigint generated always as identity primary key,
    tag_name varchar(255)  not null,

    constraint uk_tag_name unique (tag_name)
);

comment on table tbl_tag is '태그';
comment on column tbl_tag.id is 'PK';
comment on column tbl_tag.tag_name is '태그명';


-- ----------------------------------------------------------
-- 3. 뱃지 마스터 (tbl_badge)
-- ----------------------------------------------------------
drop table if exists tbl_badge cascade;

create table tbl_badge (
    id          bigint generated always as identity primary key,
    badge_key   varchar(255)  not null,
    badge_name  varchar(255) not null,
    image_file  varchar(255) not null,
    description varchar(255) null,

    constraint uk_badge_key unique (badge_key)
);

comment on table tbl_badge is '뱃지 마스터';
comment on column tbl_badge.id is 'PK';
comment on column tbl_badge.badge_key is '뱃지 식별 키';
comment on column tbl_badge.badge_name is '뱃지 표시명';
comment on column tbl_badge.image_file is '이미지 파일명';
comment on column tbl_badge.description is '획득 조건 설명';


-- ----------------------------------------------------------
-- 4. 메시지 방 (tbl_message_room)
-- ----------------------------------------------------------
drop table if exists tbl_message_room cascade;

create table tbl_message_room (
    id              bigint generated always as identity primary key,
    created_datetime      timestamp not null default now(),
    updated_datetime      timestamp not null default now()
);

comment on table tbl_message_room is '메시지 방';
comment on column tbl_message_room.id is 'PK';



-- ----------------------------------------------------------
-- 5. FAQ (tbl_faq)
-- ----------------------------------------------------------
drop table if exists tbl_faq cascade;

create table tbl_faq (
    id         bigint generated always as identity primary key,
    question   varchar(255) not null,
    answer     text         not null,
    category   varchar(255)  null,
    sort_order int      not null default 0,
    is_active  boolean      not null default true,
    created_datetime timestamp    not null default now(),
    updated_datetime timestamp    not null default now()
);

comment on table tbl_faq is 'FAQ';
comment on column tbl_faq.id is 'PK';
comment on column tbl_faq.question is '질문';
comment on column tbl_faq.answer is '답변';
comment on column tbl_faq.category is '카테고리';

create index idx_faq_category on tbl_faq (category, is_active, sort_order);



-- ----------------------------------------------------------
-- OAuth 로그인 연동 (tbl_oauth)
-- ----------------------------------------------------------
drop table if exists tbl_oauth cascade;
drop type if exists oauth_provider cascade;

create type oauth_provider as enum('kakao', 'naver', 'google');

create table tbl_oauth
(
    id                  bigint generated always as identity primary key,
    member_id           bigint not null,
    provider            oauth_provider not null,
    provider_id         varchar(255) not null,
    connected_at        timestamp not null default now(),
    created_datetime    timestamp not null default now(),
    updated_datetime    timestamp not null default   now(),
    deleted_datetime    timestamp null,

    constraint uk_oauth_provider unique (provider, provider_id),
    constraint uk_oauth_member_provider unique (member_id, provider),
    constraint fk_oauth_member foreign key (member_id) references tbl_member(id)
);

comment on table tbl_oauth is 'OAuth 로그인 연동';
comment on column tbl_oauth.id is 'OAuth 연동 번호 (PK)';
comment on column tbl_oauth.member_id is '회원 번호';
comment on column tbl_oauth.provider_id is '제공자 회원 번호';
comment on column tbl_oauth.provider is 'OAuth 제공자';
comment on column tbl_oauth.connected_at is '연동 일시';
comment on column tbl_oauth.created_datetime is '생성 일시';
comment on column tbl_oauth.updated_datetime is '수정 일시';
comment on column tbl_oauth.deleted_datetime is '탈퇴 일시 (soft delete)';


-- ----------------------------------------------------------
-- 7. 회원 관심 태그 (tbl_member_tag)
-- ----------------------------------------------------------
drop table if exists tbl_member_tag cascade;

create table tbl_member_tag (
    id            bigint generated always as identity primary key,
    member_id     bigint    not null,
    tag_id        bigint    not null,

    constraint uk_member_tag unique (member_id, tag_id),
    constraint fk_mt_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_mt_tag foreign key (tag_id)
        references tbl_tag (id)
);

comment on table tbl_member_tag is '회원 관심 태그';
comment on column tbl_member_tag.id is 'PK';

create index idx_mt_tag on tbl_member_tag (tag_id);


-- ----------------------------------------------------------
-- 8. 회원 뱃지 (tbl_member_badge)
-- ----------------------------------------------------------
drop table if exists tbl_member_badge cascade;

create table tbl_member_badge (
    id              bigint generated always as identity primary key,
    member_id       bigint    not null,
    badge_id        bigint    not null,
    is_displayed    boolean   not null default false,
    earned_at       timestamp not null default now(),

    constraint uk_mb unique (member_id, badge_id),
    constraint fk_mb_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_mb_badge foreign key (badge_id)
        references tbl_badge (id)
);

comment on table tbl_member_badge is '회원 뱃지';
comment on column tbl_member_badge.id is 'PK';
comment on column tbl_member_badge.is_displayed is '프로필 표시 여부 (max 2)';

create index idx_mb_badge on tbl_member_badge (badge_id);


-- ----------------------------------------------------------
-- 9. 알림 설정 (tbl_notification_setting)
-- ----------------------------------------------------------
drop table if exists tbl_notification_setting cascade;

create table tbl_notification_setting (
    id                  bigint generated always as identity primary key,
    member_id           bigint      not null,
    follow_notify       boolean     not null default true,
    like_bookmark_notify boolean    not null default true,
    comment_mention_notify boolean  not null default true,
    auction_notify      boolean     not null default true,
    payment_settlement_notify boolean not null default true,
    contest_notify      boolean     not null default true,
    pause_all           boolean     not null default false,
    created_datetime          timestamp   not null default now(),
    updated_datetime          timestamp   not null default now(),

    constraint uk_ns_member unique (member_id),
    constraint fk_ns_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_notification_setting is '알림 설정';
comment on column tbl_notification_setting.id is 'PK';
comment on column tbl_notification_setting.member_id is '회원 FK';
comment on column tbl_notification_setting.follow_notify is '팔로우 알림';
comment on column tbl_notification_setting.like_bookmark_notify is '좋아요 및 찜 알림';
comment on column tbl_notification_setting.comment_mention_notify is '댓글 및 멘션 알림';
comment on column tbl_notification_setting.auction_notify is '경매 알림';
comment on column tbl_notification_setting.payment_settlement_notify is '결제 및 정산 알림';
comment on column tbl_notification_setting.contest_notify is '공모전 알림';
comment on column tbl_notification_setting.pause_all is '모두 일시 중단 (0/1)';


-- ----------------------------------------------------------
-- 10. 작품 (tbl_work)
-- ----------------------------------------------------------
drop table if exists tbl_work cascade;

create table tbl_work (
    id            bigint generated always as identity primary key,
    member_id     bigint         not null,
    title         varchar(255)   not null,
    category      varchar(100)   null,
    description   text           null,
    price         int  null,
    license_type  varchar(100)   null,
    license_terms text           null,
    is_tradable   boolean        not null default false,
    allow_comment boolean        not null default true,
    show_similar  boolean        not null default true,
    link_url      varchar(255)   null,
    view_count    int        not null default 0,
    like_count    int        not null default 0,
    save_count    int        not null default 0,
    comment_count int        not null default 0,
    status        varchar(255)    not null default 'ACTIVE',
    created_datetime    timestamp      not null default now(),
    updated_datetime    timestamp      not null default now(),
    deleted_datetime    timestamp      null,

    constraint fk_work_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_work is '작품';
comment on column tbl_work.id is '작품 번호 (PK)';
comment on column tbl_work.member_id is '작성자 FK';
comment on column tbl_work.title is '제목';
comment on column tbl_work.category is '카테고리';
comment on column tbl_work.description is '설명';
comment on column tbl_work.price is '가격 (거래 토글 ON 시)';
comment on column tbl_work.license_type is '라이선스 유형 (PERSONAL / COMMERCIAL / EXCLUSIVE)';
comment on column tbl_work.license_terms is '라이선스 상세 조건';
comment on column tbl_work.is_tradable is '거래 가능 여부';
comment on column tbl_work.allow_comment is '댓글 허용';
comment on column tbl_work.show_similar is '비슷한 작품 표시';
comment on column tbl_work.link_url is '외부 링크 URL';
comment on column tbl_work.view_count is '조회수 (비정규화)';
comment on column tbl_work.like_count is '좋아요 수 (비정규화)';
comment on column tbl_work.save_count is '저장 수 (비정규화)';
comment on column tbl_work.comment_count is '댓글 수 (비정규화)';
comment on column tbl_work.status is '상태 (ACTIVE/HIDDEN/DELETED)';
comment on column tbl_work.deleted_datetime is '삭제 일시 (soft delete)';

create index idx_work_member on tbl_work (member_id);
create index idx_work_status on tbl_work (status, created_datetime desc);
create index idx_work_created on tbl_work (created_datetime desc);

select * from tbl_work;

delete from tbl_work;


-- ----------------------------------------------------------
-- 11. 작품 조회 로그 (tbl_work_view)
-- ----------------------------------------------------------
drop table if exists tbl_work_view cascade;

create table tbl_work_view (
    id               bigint generated always as identity primary key,
    work_id          bigint      not null,
    member_id        bigint      not null,
    viewed_at        timestamp   not null default now(),
    created_datetime timestamp   not null default now(),

    constraint fk_work_view_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_work_view_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_work_view is '작품 조회 로그';
comment on column tbl_work_view.id is '조회 로그 번호 (PK)';
comment on column tbl_work_view.work_id is '조회된 작품 FK';
comment on column tbl_work_view.member_id is '조회한 회원 FK';
comment on column tbl_work_view.viewed_at is '조회 시각';
comment on column tbl_work_view.created_datetime is '생성 일시';

-- 뷰 만듬
create index idx_work_view_work on tbl_work_view (work_id, viewed_at desc);
create index idx_work_view_member on tbl_work_view (member_id, viewed_at desc);
create index idx_work_view_member_work on tbl_work_view (member_id, work_id, viewed_at desc);
create index idx_work_view_viewed_at on tbl_work_view (viewed_at desc);


-- ----------------------------------------------------------
-- 11. 팔로우 (tbl_follow)
-- ----------------------------------------------------------
drop table if exists tbl_follow cascade;

create table tbl_follow (
    id           bigint generated always as identity primary key,
    follower_id  bigint      not null,
    following_id bigint      not null,
    created_datetime   timestamp   not null default now(),

    constraint uk_follow unique (follower_id, following_id),
    constraint chk_follow_self check (follower_id <> following_id),
    constraint fk_follow_follower foreign key (follower_id)
        references tbl_member (id),
    constraint fk_follow_following foreign key (following_id)
        references tbl_member (id)
);

comment on table tbl_follow is '팔로우';
comment on column tbl_follow.id is 'PK';
comment on column tbl_follow.follower_id is '팔로우 하는 사람';
comment on column tbl_follow.following_id is '팔로우 당하는 사람';

create index idx_follow_following on tbl_follow (following_id);


-- ----------------------------------------------------------
-- 12. 차단 (tbl_block)
-- ----------------------------------------------------------
drop table if exists tbl_block cascade;

create table tbl_block (
    id          bigint generated always as identity primary key,
    blocker_id  bigint      not null,
    blocked_id  bigint      not null,
    created_datetime  timestamp   not null default now(),

    constraint uk_block unique (blocker_id, blocked_id),
    constraint chk_block_self check (blocker_id <> blocked_id),
    constraint fk_block_blocker foreign key (blocker_id)
        references tbl_member (id),
    constraint fk_block_blocked foreign key (blocked_id)
        references tbl_member (id)
);

comment on table tbl_block is '차단';
comment on column tbl_block.id is 'PK';
comment on column tbl_block.blocker_id is '차단한 회원';
comment on column tbl_block.blocked_id is '차단당한 회원';

create index idx_block_blocked on tbl_block (blocked_id);

select * from tbl_block;


-- ----------------------------------------------------------
-- 13. 카드 (tbl_card)
-- ----------------------------------------------------------
drop table if exists tbl_card cascade;

create table tbl_card (
    id                 bigint generated always as identity primary key,
    member_id          bigint       not null,
    card_company       varchar(255)  not null,
    card_number_masked varchar(255)  not null,
    billing_key        varchar(255) null,
    -- 변경: 부트페이 빌링키 발급 이력을 추적하기 위한 컬럼 추가
    billing_receipt_id varchar(255) null,
    billing_method     varchar(100) null,
    billing_status     varchar(100) null,
    is_default         boolean      not null default false,
    created_datetime         timestamp    not null default now(),
    deleted_datetime         timestamp    null,

    constraint fk_card_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_card is '카드';
comment on column tbl_card.id is 'PK';
comment on column tbl_card.member_id is '회원 FK';
comment on column tbl_card.card_company is '카드사';
comment on column tbl_card.card_number_masked is '마스킹된 카드번호 (****-****-****-1234)';
comment on column tbl_card.billing_key is 'PG 빌링키 (암호화 저장)';
comment on column tbl_card.billing_receipt_id is '부트페이 빌링키 발급 receipt_id';
comment on column tbl_card.billing_method is '부트페이 빌링 결제수단 표기값';
comment on column tbl_card.billing_status is '부트페이 빌링 발급 상태값';
comment on column tbl_card.is_default is '기본 카드 여부';
comment on column tbl_card.deleted_datetime is '삭제 일시';

create index idx_card_member on tbl_card (member_id);


-- ----------------------------------------------------------
-- 15. 검색 이력 (tbl_search_history)
-- ----------------------------------------------------------
drop table if exists tbl_search_history cascade;

create table tbl_search_history (
    id          bigint generated always as identity primary key,
    member_id   bigint       not null,
    keyword     varchar(255) not null,
    searched_at timestamp    not null default now(),

    constraint fk_sh_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_search_history is '검색 이력';
comment on column tbl_search_history.id is 'PK';
comment on column tbl_search_history.member_id is '회원 FK';
comment on column tbl_search_history.keyword is '검색 키워드';
comment on column tbl_search_history.searched_at is '검색 일시';

create index idx_sh_member on tbl_search_history (member_id, searched_at desc);
create index idx_sh_searched_at on tbl_search_history (searched_at);


-- ----------------------------------------------------------
-- 16. 문의 (tbl_inquiry)
-- ----------------------------------------------------------
drop table if exists tbl_inquiry cascade;

create table tbl_inquiry
(
    id               bigint generated always as identity primary key,
    member_id        bigint       null,
    category         varchar(255) null,
    content          text         not null,
    reply            text         null,
    status           varchar(255) not null default 'PENDING',
    created_datetime timestamp    not null default now(),
    updated_datetime timestamp    not null default now(),

    constraint fk_inquiry_member foreign key (member_id)
        references tbl_member (id),
    constraint chk_inquiry_status
        check (status in ('PENDING', 'ANSWERED', 'CLOSED'))
);

comment on table tbl_inquiry is '문의';
comment on column tbl_inquiry.id is 'PK';
comment on column tbl_inquiry.member_id is '회원 FK (비회원 문의 가능)';
comment on column tbl_inquiry.category is '문의 카테고리';
comment on column tbl_inquiry.content is '문의 내용';
comment on column tbl_inquiry.reply is '관리자 답변';
comment on column tbl_inquiry.status is '상태 (PENDING/ANSWERED/CLOSED)';

create index idx_inquiry_member on tbl_inquiry (member_id);
create index idx_inquiry_status on tbl_inquiry (status, created_datetime desc);

-- 기존 테이블에 제약조건만 추가할 경우 아래 실행
alter table tbl_inquiry add constraint chk_inquiry_status check (status in ('PENDING', 'ANSWERED', 'CLOSED'));


-- ----------------------------------------------------------
-- 17. 작품 파일 (tbl_work_file)
-- ----------------------------------------------------------
drop table if exists tbl_work_file cascade;

create table tbl_work_file (
    id           bigint generated always as identity primary key,
    work_id      bigint       not null,
    file_url     text         not null,
    file_type    varchar(255)  not null,
    file_size    int      null,
    width        int      null,
    height       int      null,
    sort_order   int      not null default 0,
    created_datetime   timestamp    not null default now(),

    constraint fk_wf_work foreign key (work_id)
        references tbl_work (id)
);

-- alter table tbl_work_file alter column file_url type text;

comment on table tbl_work_file is '작품 파일';
comment on column tbl_work_file.id is 'PK';
comment on column tbl_work_file.work_id is '작품 FK';
comment on column tbl_work_file.file_url is '파일 URL 또는 data URL';
comment on column tbl_work_file.file_type is '파일 타입 (IMAGE / VIDEO / THUMBNAIL)';
comment on column tbl_work_file.file_size is '파일 크기 (bytes)';
comment on column tbl_work_file.width is '이미지 너비 (px)';
comment on column tbl_work_file.height is '이미지 높이 (px)';
comment on column tbl_work_file.sort_order is '정렬 순서';

create index idx_wf_work on tbl_work_file (work_id);

delete from tbl_work_file;


-- ----------------------------------------------------------
-- 18. 작품 태그 (tbl_work_tag)
-- ----------------------------------------------------------
drop table if exists tbl_work_tag cascade;

create table tbl_work_tag (
    id          bigint generated always as identity primary key,
    work_id     bigint    not null,
    tag_id      bigint    not null,

    constraint uk_work_tag unique (work_id, tag_id),
    constraint fk_wt_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_wt_tag foreign key (tag_id)
        references tbl_tag (id)
);

comment on table tbl_work_tag is '작품 태그';
comment on column tbl_work_tag.id is 'PK';
comment on column tbl_work_tag.work_id is '작품 FK';
comment on column tbl_work_tag.tag_id is '태그 FK';

create index idx_wt_tag on tbl_work_tag (tag_id);

delete from tbl_work_tag;

-- ----------------------------------------------------------
-- 19. 예술관 (tbl_gallery)
-- ----------------------------------------------------------
drop table if exists tbl_gallery cascade;

create table tbl_gallery (
    id            bigint generated always as identity primary key,
    member_id     bigint       not null,
    title         varchar(255) not null,
    description   text         null,
    cover_image   text         null,
    allow_comment boolean      not null default true,
    show_similar  boolean      not null default true,
    work_count    int      not null default 0,
    like_count    int      not null default 0,
    comment_count int      not null default 0,
    view_count    int      not null default 0,
    status        varchar(255)  not null default 'EXHIBITING',
    created_datetime    timestamp    not null default now(),
    updated_datetime    timestamp    not null default now(),
    deleted_datetime    timestamp    null,

    constraint fk_gallery_member foreign key (member_id)
        references tbl_member (id)
);

-- alter table tbl_gallery alter column  cover_image type text;

comment on table tbl_gallery is '예술관';
comment on column tbl_gallery.id is '예술관 번호 (PK)';
comment on column tbl_gallery.member_id is '소유자 FK';
comment on column tbl_gallery.title is '제목';
comment on column tbl_gallery.description is '설명';
comment on column tbl_gallery.cover_image is '커버 이미지 URL 또는 data URL';
comment on column tbl_gallery.allow_comment is '댓글 허용';
comment on column tbl_gallery.show_similar is '비슷한 작품 표시';
comment on column tbl_gallery.work_count is '소속 작품 수 (비정규화)';
comment on column tbl_gallery.like_count is '좋아요 수 (비정규화)';
comment on column tbl_gallery.comment_count is '댓글 수 (비정규화)';
comment on column tbl_gallery.view_count is '조회수 (비정규화)';
comment on column tbl_gallery.status is '상태 (EXHIBITING/SCHEDULED/ENDED/DELETED)';
comment on column tbl_gallery.deleted_datetime is '삭제 일시';

create index idx_gallery_member on tbl_gallery (member_id);
create index idx_gallery_status on tbl_gallery (status, created_datetime desc);


-- ----------------------------------------------------------
-- 20. 콘테스트 (tbl_contest)
-- ----------------------------------------------------------
drop table if exists tbl_contest cascade;

create table tbl_contest (
    id          bigint generated always as identity primary key,
    member_id   bigint        not null,
    title       varchar(255)  not null,
    organizer   varchar(255)  not null,
    category    varchar(100)  null,
    description text          null,
    cover_image text          null,
    entry_start date          not null,
    entry_end   date          not null,
    result_date date          null,
    prize_info  varchar(255)  null,
    price       int null,
    status      varchar(255)   not null default 'UPCOMING',
    entry_count int       not null default 0,
    view_count  int       not null default 0,
    winner_notified_at  timestamp     null,
    created_datetime  timestamp     not null default now(),
    updated_datetime  timestamp     not null default now(),
    deleted_datetime  timestamp     null,

    constraint fk_contest_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_contest is '콘테스트';
comment on column tbl_contest.id is '콘테스트 번호 (PK)';
comment on column tbl_contest.member_id is '등록자 FK';
comment on column tbl_contest.title is '제목';
comment on column tbl_contest.organizer is '주최/주관 기관';
comment on column tbl_contest.category is '분야';
comment on column tbl_contest.description is '목적 및 내용';
comment on column tbl_contest.cover_image is '대표 이미지 URL';
comment on column tbl_contest.entry_start is '접수 시작일';
comment on column tbl_contest.entry_end is '접수 마감일';
comment on column tbl_contest.result_date is '결과 발표일';
comment on column tbl_contest.prize_info is '상금 및 부상';
comment on column tbl_contest.price is '참가비';
comment on column tbl_contest.status is '상태 (UPCOMING/OPEN/CLOSED/RESULT)';
comment on column tbl_contest.entry_count is '출품 수 (비정규화)';
comment on column tbl_contest.view_count is '조회수 (비정규화)';
comment on column tbl_contest.winner_notified_at is '수상자 알림 발송 일시';
comment on column tbl_contest.deleted_datetime is '삭제 일시';

create index idx_contest_member on tbl_contest (member_id);
create index idx_contest_status on tbl_contest (status, entry_start);


ALTER TABLE tbl_contest
    ADD COLUMN winner_notified_at timestamp NULL;

COMMENT ON COLUMN tbl_contest.winner_notified_at IS '수상자 알림 발송 일시';

-- ----------------------------------------------------------
-- 21. 작품 좋아요 (tbl_work_like)
-- ----------------------------------------------------------
drop table if exists tbl_work_like cascade;

create table tbl_work_like (
    id bigint generated always as identity primary key,
    work_id bigint not null,
    member_id bigint not null,
    created_datetime timestamp not null default now(),

    constraint uk_work_like unique (work_id, member_id),
    constraint fk_work_like_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_work_like_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_work_like is '작품 좋아요';
comment on column tbl_work_like.id is 'PK';
comment on column tbl_work_like.work_id is '작품 FK';
comment on column tbl_work_like.member_id is '좋아요 한 회원 FK';

create index idx_work_like_work on tbl_work_like (work_id);
create index idx_work_like_member on tbl_work_like (member_id);


-- ----------------------------------------------------------
-- 22. 예술관 좋아요 (tbl_gallery_like)
-- ----------------------------------------------------------
drop table if exists tbl_gallery_like cascade;

create table tbl_gallery_like (
    id bigint generated always as identity primary key,
    gallery_id bigint not null,
    member_id bigint not null,
    created_datetime timestamp not null default now(),

    constraint uk_gallery_like unique (gallery_id, member_id),
    constraint fk_gallery_like_gallery foreign key (gallery_id)
        references tbl_gallery (id),
    constraint fk_gallery_like_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_gallery_like is '예술관 좋아요';
comment on column tbl_gallery_like.id is 'PK';
comment on column tbl_gallery_like.gallery_id is '예술관 FK';
comment on column tbl_gallery_like.member_id is '좋아요 한 회원 FK';

create index idx_gallery_like_gallery on tbl_gallery_like (gallery_id);
create index idx_gallery_like_member on tbl_gallery_like (member_id);


-- ----------------------------------------------------------
-- 22. 북마크 (tbl_bookmark)
-- ----------------------------------------------------------
drop table if exists tbl_bookmark cascade;

create table tbl_bookmark (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null,
    target_type varchar(255) not null,
    target_id   bigint      not null,
    created_datetime  timestamp   not null default now(),

    constraint uk_bookmark unique (member_id, target_type, target_id),
    constraint fk_bookmark_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_bookmark is '북마크';
comment on column tbl_bookmark.id is 'PK';
comment on column tbl_bookmark.member_id is '저장한 회원';
comment on column tbl_bookmark.target_type is '대상 타입 (WORK / GALLERY / CONTEST)';
comment on column tbl_bookmark.target_id is '대상 PK';

create index idx_bookmark_target on tbl_bookmark (target_type, target_id);




-- ----------------------------------------------------------
-- 23. 댓글 (tbl_comment)
-- ----------------------------------------------------------
drop table if exists tbl_comment cascade;

create table tbl_comment (
    id          bigint generated always as identity primary key,
    member_id   bigint       not null,
    target_type varchar(255)  not null,
    target_id   bigint       not null,
    parent_id   bigint       null,
    content     varchar(255) not null,
    is_pinned   boolean      not null default false,
    like_count  int      not null default 0,
    created_datetime  timestamp    not null default now(),
    updated_datetime  timestamp    not null default now(),
    deleted_datetime  timestamp    null,

    constraint fk_comment_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_comment_parent foreign key (parent_id)
        references tbl_comment (id)
);

comment on table tbl_comment is '댓글';
comment on column tbl_comment.id is 'PK';
comment on column tbl_comment.member_id is '작성자 FK';
comment on column tbl_comment.target_type is '대상 타입 (WORK / GALLERY)';
comment on column tbl_comment.target_id is '대상 PK';
comment on column tbl_comment.parent_id is '부모 댓글 (대댓글)';
comment on column tbl_comment.content is '댓글 내용';
comment on column tbl_comment.is_pinned is '고정 여부';
comment on column tbl_comment.like_count is '좋아요 수 (비정규화)';
comment on column tbl_comment.deleted_datetime is '삭제 일시 (soft delete)';

create index idx_comment_target on tbl_comment (target_type, target_id, created_datetime);
create index idx_comment_member on tbl_comment (member_id);
create index idx_comment_parent on tbl_comment (parent_id);



-- ----------------------------------------------------------
-- 24. 댓글 좋아요 (tbl_comment_like)
-- ----------------------------------------------------------
drop table if exists tbl_comment_like cascade;

create table tbl_comment_like (
    id              bigint generated always as identity primary key,
    comment_id      bigint    not null,
    member_id       bigint    not null,
    created_datetime      timestamp not null default now(),

    constraint uk_comment_like unique (comment_id, member_id),
    constraint fk_cl_comment foreign key (comment_id)
        references tbl_comment (id),
    constraint fk_cl_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_comment_like is '댓글 좋아요';
comment on column tbl_comment_like.id is 'PK';

create index idx_cl_member on tbl_comment_like (member_id);


-- ----------------------------------------------------------
-- 25. 숨기기 (tbl_hide)
-- ----------------------------------------------------------
drop table if exists tbl_hide cascade;

create table tbl_hide (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null,
    target_type varchar(255) not null,
    target_id   bigint      not null,
    created_datetime  timestamp   not null default now(),

    constraint uk_hide unique (member_id, target_type, target_id),
    constraint fk_hide_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_hide is '숨기기';
comment on column tbl_hide.id is 'PK';
comment on column tbl_hide.member_id is '숨긴 회원';
comment on column tbl_hide.target_type is '대상 타입 (WORK / GALLERY)';
comment on column tbl_hide.target_id is '대상 PK';


-- ----------------------------------------------------------
-- 26. 신고 (tbl_report)
-- ----------------------------------------------------------
drop table if exists tbl_report cascade;

create table tbl_report (
    id          bigint generated always as identity primary key,
    reporter_id bigint       not null,
    target_type varchar(255)  not null,
    target_id   bigint       not null,
    reason      varchar(255)  not null,
    detail      varchar(255) null,
    status      varchar(255)  not null default 'PENDING',
    resolved_at timestamp    null,
    created_datetime  timestamp    not null default now(),
    updated_datetime  timestamp    not null default now(),

    constraint fk_report_reporter foreign key (reporter_id)
        references tbl_member (id),
    constraint chk_report_target_type
        check (target_type in ('WORK', 'MEMBER', 'COMMENT', 'GALLERY')),
    constraint chk_report_reason
        check (reason in ('SENSITIVE', 'IMPERSONATION', 'HARASSMENT', 'COPYRIGHT')),
    constraint chk_report_status
        check (status in ('PENDING', 'REVIEWING', 'RESOLVED', 'CANCELLED'))
);

comment on table tbl_report is '신고';
comment on column tbl_report.id is 'PK';
comment on column tbl_report.reporter_id is '신고자 FK';
comment on column tbl_report.target_type is '대상 타입 (WORK/MEMBER/COMMENT/GALLERY)';
comment on column tbl_report.target_id is '대상 PK';
comment on column tbl_report.reason is '위반 사항 (SENSITIVE/IMPERSONATION/HARASSMENT/COPYRIGHT)';
comment on column tbl_report.detail is '상세 내용';
comment on column tbl_report.status is '상태 (PENDING/REVIEWING/RESOLVED/CANCELLED)';
comment on column tbl_report.resolved_at is '처리 완료 일시';

create index idx_report_reporter on tbl_report (reporter_id);
create index idx_report_target on tbl_report (target_type, target_id);
create index idx_report_status on tbl_report (status, created_datetime desc);

-- 기존 테이블에 제약조건만 추가할 경우 아래 실행
alter table tbl_report add constraint chk_report_target_type check (target_type in ('WORK', 'MEMBER', 'COMMENT', 'GALLERY'));
alter table tbl_report add constraint chk_report_reason check (reason in ('SENSITIVE', 'IMPERSONATION', 'HARASSMENT', 'COPYRIGHT'));
alter table tbl_report add constraint chk_report_status check (status in ('PENDING', 'REVIEWING', 'RESOLVED', 'CANCELLED'));


-- ----------------------------------------------------------
-- 27. 회원 이용 제한 (tbl_member_restriction)
-- ----------------------------------------------------------
drop table if exists tbl_member_restriction cascade;

create table tbl_member_restriction
(
    id bigint generated always as identity primary key,
    member_id bigint not null,
    report_id bigint null,
    restriction_type varchar(20) not null,
    reason text not null,
    previous_member_status varchar(20) not null,
    status varchar(20) not null default 'ACTIVE',
    start_datetime timestamp not null default now(),
    end_datetime timestamp null,
    released_datetime timestamp null,
    created_datetime timestamp not null default now(),
    updated_datetime timestamp not null default now(),

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

comment on table tbl_member_restriction is '관리자 회원 이용 제한';
comment on column tbl_member_restriction.member_id is '제한 대상 회원 fk';
comment on column tbl_member_restriction.report_id is '관련 신고 fk';
comment on column tbl_member_restriction.restriction_type is '제한 종류 (BLOCK/LIMIT)';
comment on column tbl_member_restriction.reason is '제한 사유';
comment on column tbl_member_restriction.previous_member_status is '제한 전 회원 상태';
comment on column tbl_member_restriction.status is '제한 상태 (ACTIVE/RELEASED/EXPIRED)';
comment on column tbl_member_restriction.start_datetime is '제한 시작 일시';
comment on column tbl_member_restriction.end_datetime is '제한 종료 일시';
comment on column tbl_member_restriction.released_datetime is '제한 해제 일시';

create unique index ux_member_restriction_active
    on tbl_member_restriction (member_id)
    where status = 'ACTIVE';

create index idx_member_restriction_status
    on tbl_member_restriction (status, created_datetime desc);

create index idx_member_restriction_type
    on tbl_member_restriction (restriction_type, created_datetime desc);


-- ----------------------------------------------------------
-- 27. 알림 (tbl_notification)
-- ----------------------------------------------------------
drop table if exists tbl_notification cascade;

create table tbl_notification (
    id              bigint generated always as identity primary key,
    member_id       bigint       not null,
    sender_id       bigint       null,
    noti_type       varchar(255)  not null,
    target_type     varchar(255)  null,
    target_id       bigint       null,
    message         varchar(255) not null,
    is_read         boolean      not null default false,
    created_datetime      timestamp    not null default now(),

    constraint fk_noti_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_noti_sender foreign key (sender_id)
        references tbl_member (id)
);

comment on table tbl_notification is '알림';
comment on column tbl_notification.id is 'PK';
comment on column tbl_notification.member_id is '수신자 FK';
comment on column tbl_notification.sender_id is '발신자 FK (시스템 알림은 NULL)';
comment on column tbl_notification.noti_type is '알림 타입 (LIKE/COMMENT/FOLLOW/BID/AUCTION_END/SETTLEMENT 등)';
comment on column tbl_notification.target_type is '대상 타입';
comment on column tbl_notification.target_id is '대상 PK';
comment on column tbl_notification.message is '알림 메시지';
comment on column tbl_notification.is_read is '읽음 여부';

create index idx_noti_member on tbl_notification (member_id, is_read, created_datetime desc);


-- ----------------------------------------------------------
-- 28. 메시지 방 참여자 (tbl_message_room_member)
-- ----------------------------------------------------------
drop table if exists tbl_message_room_member cascade;

create table tbl_message_room_member (
    id              bigint generated always as identity primary key,
    message_room_id bigint    not null,
    member_id       bigint    not null,
    joined_at       timestamp not null default now(),
    left_at         timestamp null,

    constraint uk_room_member unique (message_room_id, member_id),
    constraint fk_mrm_room foreign key (message_room_id)
        references tbl_message_room (id),
    constraint fk_mrm_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_message_room_member is '메시지 방 참여자';
comment on column tbl_message_room_member.id is 'PK';

create index idx_mrm_member on tbl_message_room_member (member_id);


-- ----------------------------------------------------------
-- 29. 메시지 (tbl_message)
-- ----------------------------------------------------------
drop table if exists tbl_message cascade;

create table tbl_message (
    id                bigint generated always as identity primary key,
    message_room_id   bigint       not null,
    sender_id         bigint       not null,
    reply_to_message_id bigint     null,
    content           varchar(255) not null,
    is_read           boolean      not null default false,
    like_count        int          not null default 0,
    created_datetime  timestamp    not null default now(),
    updated_datetime  timestamp    not null default now(),
    deleted_datetime  timestamp    null,

    constraint fk_msg_room foreign key (message_room_id)
        references tbl_message_room (id),
    constraint fk_msg_sender foreign key (sender_id)
        references tbl_member (id),
    constraint fk_msg_reply foreign key (reply_to_message_id)
        references tbl_message (id)
);

comment on table tbl_message is '메시지';
comment on column tbl_message.id is 'PK';
comment on column tbl_message.message_room_id is '메시지 방 FK';
comment on column tbl_message.sender_id is '발신자 FK';
comment on column tbl_message.reply_to_message_id is '답장 대상 메시지 FK';
comment on column tbl_message.content is '메시지 내용';
comment on column tbl_message.is_read is '읽음 여부';
comment on column tbl_message.like_count is '좋아요 수 (비정규화)';
comment on column tbl_message.updated_datetime is '수정 일시';
comment on column tbl_message.deleted_datetime is '삭제 일시 (soft delete)';

create index idx_msg_room on tbl_message (message_room_id, created_datetime);
create index idx_msg_sender on tbl_message (sender_id);
create index idx_msg_reply on tbl_message (reply_to_message_id);


-- ----------------------------------------------------------
-- 30. 메시지 좋아요 (tbl_message_like)
-- ----------------------------------------------------------
drop table if exists tbl_message_like cascade;

create table tbl_message_like (
    id               bigint generated always as identity primary key,
    message_id       bigint    not null,
    member_id        bigint    not null,
    created_datetime timestamp not null default now(),

    constraint uk_message_like unique (message_id, member_id),
    constraint fk_message_like_message foreign key (message_id)
        references tbl_message (id),
    constraint fk_message_like_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_message_like is '메시지 좋아요';
comment on column tbl_message_like.id is 'PK';
comment on column tbl_message_like.message_id is '메시지 FK';
comment on column tbl_message_like.member_id is '좋아요 한 회원';

create index idx_message_like_message on tbl_message_like (message_id);
create index idx_message_like_member on tbl_message_like (member_id);


-- ----------------------------------------------------------
-- 30. 노출 제어 (tbl_display_control)
-- ----------------------------------------------------------
drop table if exists tbl_display_control cascade;

create table tbl_display_control (
    id                 bigint generated always as identity primary key,
    target_type        varchar(255)  not null,
    target_id          bigint       not null,
    action             varchar(255)  not null,
    reason             varchar(255) null,
    block_type         varchar(255) null,
    end_datetime       timestamp    null,
    admin_id           bigint       not null,
    created_datetime         timestamp    not null default now(),

    constraint fk_dc_admin foreign key (admin_id)
        references tbl_member (id),
    constraint chk_dc_block_type check (block_type in ('PERMANENT', 'PERIOD', 'TEMPORARY'))
);

comment on table tbl_display_control is '노출 제어';
comment on column tbl_display_control.id is 'PK';
comment on column tbl_display_control.target_type is '대상 타입 (WORK/GALLERY/AUCTION/MEMBER)';
comment on column tbl_display_control.target_id is '대상 PK';
comment on column tbl_display_control.action is '제어 동작 (HIDE/RESTRICT/BAN)';
comment on column tbl_display_control.reason is '제어 사유';
comment on column tbl_display_control.block_type is '차단 유형 (PERMANENT/PERIOD/TEMPORARY)';
comment on column tbl_display_control.end_datetime is '제한 종료일';
comment on column tbl_display_control.admin_id is '처리 관리자 FK';

create index idx_dc_target on tbl_display_control (target_type, target_id);
create index idx_dc_admin on tbl_display_control (admin_id);


-- ----------------------------------------------------------
-- 31. 큐레이터 설정 (tbl_curator_setting)
-- ----------------------------------------------------------
drop table if exists tbl_curator_setting cascade;

create table tbl_curator_setting (
    id                 bigint generated always as identity primary key,
    section            varchar(255)     not null,
    target_type        varchar(255)     not null,
    target_id          bigint          not null,
    sort_order         int         not null default 0,
    is_active          boolean         not null default true,
    curator_name       varchar(255)    not null,
    theme_title        varchar(255)    not null,
    intro              text            null,
    admin_id           bigint          not null,
    created_datetime         timestamp       not null default now(),
    updated_datetime         timestamp       not null default now(),

    constraint fk_cs_admin foreign key (admin_id)
        references tbl_member (id)
);

comment on table  tbl_curator_setting                    is '큐레이터 설정';
comment on column tbl_curator_setting.id                 is 'PK';
comment on column tbl_curator_setting.section            is '섹션 (HERO/FEATURED/TRENDING)';
comment on column tbl_curator_setting.target_type        is '대상 타입 (WORK / GALLERY)';
comment on column tbl_curator_setting.target_id          is '대상 PK';
comment on column tbl_curator_setting.curator_name       is '큐레이터명';
comment on column tbl_curator_setting.theme_title        is '추천 테마';
comment on column tbl_curator_setting.intro              is '큐레이터 한줄 소개';
comment on column tbl_curator_setting.admin_id           is '설정한 관리자 FK';

create index idx_cs_section on tbl_curator_setting (section, is_active, sort_order);
create index idx_cs_admin   on tbl_curator_setting (admin_id);



-- ----------------------------------------------------------
-- 32. 예술관 태그 (tbl_gallery_tag)
-- ----------------------------------------------------------
drop table if exists tbl_gallery_tag cascade;

create table tbl_gallery_tag (
    id             bigint generated always as identity primary key,
    gallery_id     bigint    not null,
    tag_id         bigint    not null,

    constraint uk_gallery_tag unique (gallery_id, tag_id),
    constraint fk_gt_gallery foreign key (gallery_id)
    references tbl_gallery (id),
    constraint fk_gt_tag foreign key (tag_id)
    references tbl_tag (id)
);

comment on table  tbl_gallery_tag                is '예술관 태그';
comment on column tbl_gallery_tag.id             is 'PK';

create index idx_gt_tag on tbl_gallery_tag (tag_id);


-- ----------------------------------------------------------
-- 33. 예술관 작품 (tbl_gallery_work)
-- ----------------------------------------------------------
drop table if exists tbl_gallery_work cascade;

create table tbl_gallery_work (
    id              bigint generated always as identity primary key,
    gallery_id      bigint    not null,
    work_id         bigint    not null,
    sort_order      int   not null default 0,
    added_at        timestamp not null default now(),

    constraint uk_gallery_work unique (gallery_id, work_id),
    constraint fk_gw_gallery foreign key (gallery_id)
        references tbl_gallery (id),
    constraint fk_gw_work foreign key (work_id)
        references tbl_work (id)
);

comment on table  tbl_gallery_work                 is '예술관 작품';
comment on column tbl_gallery_work.id              is 'PK';
comment on column tbl_gallery_work.sort_order      is '전시 순서';

create index idx_gw_work on tbl_gallery_work (work_id);


-- ----------------------------------------------------------
-- 34. 콘테스트 태그 (tbl_contest_tag)
-- ----------------------------------------------------------
drop table if exists tbl_contest_tag cascade;

create table tbl_contest_tag (
    id         bigint generated always as identity primary key,
    contest_id bigint    not null,
    tag_id     bigint    not null,

    constraint uk_contest_tag unique (contest_id, tag_id),
    constraint fk_ct_contest foreign key (contest_id)
        references tbl_contest (id),
    constraint fk_ct_tag foreign key (tag_id)
        references tbl_tag (id)
);

comment on table  tbl_contest_tag                is '콘테스트 태그';
comment on column tbl_contest_tag.id is 'PK';

create index idx_ct_tag on tbl_contest_tag (tag_id);


-- ----------------------------------------------------------
-- 35. 콘테스트 출품 (tbl_contest_entry)
-- ----------------------------------------------------------
drop table if exists tbl_contest_entry cascade;

create table tbl_contest_entry (
    id           bigint generated always as identity primary key,
    contest_id   bigint      not null,
    work_id      bigint      not null,
    member_id    bigint      not null,
    award_rank   varchar(255) null,
    submitted_at timestamp   not null default now(),

    constraint uk_contest_entry unique (contest_id, work_id),
    constraint fk_ce_contest foreign key (contest_id)
        references tbl_contest (id),
    constraint fk_ce_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_ce_member foreign key (member_id)
        references tbl_member (id)
);

comment on table  tbl_contest_entry                  is '콘테스트 출품';
comment on column tbl_contest_entry.id         is 'PK';
comment on column tbl_contest_entry.contest_id is '콘테스트 FK';
comment on column tbl_contest_entry.work_id    is '출품 작품 FK';
comment on column tbl_contest_entry.member_id  is '출품자 FK';
comment on column tbl_contest_entry.award_rank       is '수상 순위 (금/은/동/입선 등)';

create index idx_ce_work   on tbl_contest_entry (work_id);
create index idx_ce_member on tbl_contest_entry (member_id);


-- ----------------------------------------------------------
-- 36. 경매 (tbl_auction)
-- ----------------------------------------------------------
drop table if exists tbl_auction cascade;

create table tbl_auction
(
    id                bigint generated always as identity primary key,
    work_id           bigint           not null,
    seller_id         bigint           not null,
    asking_price      int              not null,
    starting_price    int              not null,
    estimate_low      int              null,
    estimate_high     int              null,
    bid_increment     int              not null default 10000,
    current_price     int              null,
    bid_count         int              not null default 0,
    fee_rate          double precision not null default 0.10,
    fee_amount        int              not null,
    settlement_amount int              not null,
    deadline_hours    int              not null,
    started_at        timestamp        not null default now(),
    closing_at        timestamp        not null,
    cancel_threshold  double precision not null default 0.70,
    status            varchar(255)     not null default 'ACTIVE',
    winner_id         bigint           null,
    final_price       int              null,
    created_datetime  timestamp        not null default now(),
    updated_datetime  timestamp        not null default now(),

    constraint fk_auction_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_auction_seller foreign key (seller_id)
        references tbl_member (id),
    constraint fk_auction_winner foreign key (winner_id)
        references tbl_member (id),
    constraint chk_auction_price check (starting_price <= asking_price),
    constraint chk_auction_deadline check (deadline_hours > 0),
    constraint chk_auction_cancel_threshold check (cancel_threshold > 0 and cancel_threshold <= 1)
);

comment on table tbl_auction is '경매';
comment on column tbl_auction.id is '경매 번호 (PK)';
comment on column tbl_auction.work_id is '작품 FK';
comment on column tbl_auction.seller_id is '판매자(등록자) FK';
comment on column tbl_auction.asking_price is '판매 희망가';
comment on column tbl_auction.starting_price is '시작가';
comment on column tbl_auction.estimate_low is '추정가 하한';
comment on column tbl_auction.estimate_high is '추정가 상한';
comment on column tbl_auction.bid_increment is '호가 단위';
comment on column tbl_auction.current_price is '현재 최고가';
comment on column tbl_auction.bid_count is '입찰 횟수 (비정규화)';
comment on column tbl_auction.fee_rate is '수수료율 (10%)';
comment on column tbl_auction.fee_amount is '예상 수수료 금액 (희망가 기준)';
comment on column tbl_auction.settlement_amount is '정산 금액 (희망가 - 수수료)';
comment on column tbl_auction.deadline_hours is '마감기한 (시간 단위)';
comment on column tbl_auction.started_at is '경매 시작 시각';
comment on column tbl_auction.closing_at is '경매 마감 시각';
comment on column tbl_auction.cancel_threshold is '취소 불가 기준 (70%)';
comment on column tbl_auction.status is '상태 (ACTIVE/CLOSED/SOLD/CANCELLED)';
comment on column tbl_auction.winner_id is '낙찰자 FK';
comment on column tbl_auction.final_price is '낙찰가';

create index idx_auction_work on tbl_auction (work_id);
create index idx_auction_seller on tbl_auction (seller_id);
create index idx_auction_status on tbl_auction (status, closing_at);
create index idx_auction_closing on tbl_auction (closing_at);


-- ----------------------------------------------------------
-- 37. 입찰 (tbl_bid)
-- ----------------------------------------------------------
drop table if exists tbl_bid cascade;

create table tbl_bid (
    id         bigint generated always as identity primary key,
    auction_id bigint        not null,
    member_id  bigint        not null,
    bid_price  int not null,
    is_winning boolean       not null default false,
    created_datetime timestamp     not null default now(),

    constraint fk_bid_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_bid_member foreign key (member_id)
        references tbl_member (id),
    constraint chk_bid_price check (bid_price > 0)
);

comment on table  tbl_bid            is '입찰';
comment on column tbl_bid.id         is 'PK';
comment on column tbl_bid.auction_id is '경매 FK';
comment on column tbl_bid.member_id  is '입찰자 FK';
comment on column tbl_bid.bid_price  is '입찰 금액';
comment on column tbl_bid.is_winning is '최고가 여부';

create index idx_bid_auction on tbl_bid (auction_id, bid_price desc);
create index idx_bid_member  on tbl_bid (member_id);


-- ----------------------------------------------------------
-- 38. 경매 찜 (tbl_auction_wishlist)
-- ----------------------------------------------------------
drop table if exists tbl_auction_wishlist cascade;

create table tbl_auction_wishlist (
    id         bigint generated always as identity primary key,
    auction_id bigint    not null,
    member_id  bigint    not null,
    created_datetime timestamp not null default now(),

    constraint uk_auction_wish unique (auction_id, member_id),
    constraint fk_aw_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_aw_member foreign key (member_id)
        references tbl_member (id)
);

comment on table  tbl_auction_wishlist                     is '경매 찜';
comment on column tbl_auction_wishlist.id is 'PK';

create index idx_aw_member on tbl_auction_wishlist (member_id);


-- ----------------------------------------------------------
-- 39. 주문 (tbl_order)
-- ----------------------------------------------------------
drop table if exists tbl_order cascade;

create table tbl_order (
    id               bigint generated always as identity primary key,
    order_code       varchar(255)   not null,
    buyer_id         bigint         not null,
    seller_id        bigint         not null,
    work_id          bigint         not null,
    auction_id       bigint         null,
    order_type       varchar(255)   not null default 'DIRECT',
    license_type     varchar(255)   not null default 'PERSONAL',
    original_price   int            not null,
    discount_amount  int            not null default 0,
    fee_amount       int            not null default 0,
    total_price      int            not null,
    deposit_amount   int            not null default 0,
    deposit_status   varchar(255)   null,
    balance_due_at   timestamp      null,
    ordered_at       timestamp      not null default now(),
    paid_at          timestamp      null,
    completed_at     timestamp      null,
    refunded_at      timestamp      null,
    status           varchar(255)   not null default 'PENDING_PAYMENT',

    constraint uk_order_code unique (order_code),
    constraint fk_order_buyer foreign key (buyer_id)
        references tbl_member (id),
    constraint fk_order_seller foreign key (seller_id)
        references tbl_member (id),
    constraint fk_order_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_order_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint chk_order_self check (buyer_id <> seller_id)
);

comment on table tbl_order is '주문';
comment on column tbl_order.id is 'PK';
comment on column tbl_order.order_code is '주문 코드';
comment on column tbl_order.buyer_id is '구매자 FK';
comment on column tbl_order.seller_id is '판매자 FK';
comment on column tbl_order.work_id is '작품 FK';
comment on column tbl_order.auction_id is '경매 FK';
comment on column tbl_order.order_type is '주문 유형 (DIRECT / AUCTION)';
comment on column tbl_order.license_type is '구매 라이선스 유형';
comment on column tbl_order.original_price is '원가';
comment on column tbl_order.discount_amount is '할인 금액';
comment on column tbl_order.fee_amount is '수수료';
comment on column tbl_order.total_price is '총 결제 예정 금액';
comment on column tbl_order.deposit_amount is '보증금';
comment on column tbl_order.deposit_status is '보증금 상태 (HELD / REFUNDED / APPLIED)';
comment on column tbl_order.balance_due_at is '잔금 결제 기한';
comment on column tbl_order.ordered_at is '주문 생성 일시';
comment on column tbl_order.paid_at is '결제 완료 일시';
comment on column tbl_order.completed_at is '주문 완료 일시';
comment on column tbl_order.refunded_at is '환불 완료 일시';
comment on column tbl_order.status is '상태 (PENDING_PAYMENT / DEPOSIT_HELD / PAID / COMPLETED / CANCELLED / REFUNDED)';

create index idx_order_buyer on tbl_order (buyer_id, ordered_at desc);
create index idx_order_seller on tbl_order (seller_id, ordered_at desc);
create index idx_order_work on tbl_order (work_id);
create index idx_order_auction on tbl_order (auction_id);
create index idx_order_status on tbl_order (status, ordered_at desc);


-- ----------------------------------------------------------
-- 39. 결제 (tbl_payment)
-- ----------------------------------------------------------
drop table if exists tbl_payment cascade;

create table tbl_payment (
    id              bigint generated always as identity primary key,
    payment_code    varchar(255)   not null,
    order_code      varchar(255)   not null,
    buyer_id        bigint        not null,
    seller_id       bigint        not null,
    work_id         bigint        not null,
    auction_id      bigint        null,
    original_amount int not null,
    total_price     int not null,
    total_fee       int not null,
    payment_purpose varchar(255)   not null default 'PURCHASE',
    pay_method      varchar(255)   not null,
    card_id         bigint        null,
    -- 변경: 부트페이 서버 결제 영수증 추적용 컬럼 추가
    pg_receipt_id   varchar(255)  null,
    status          varchar(255)   not null default 'PENDING',
    paid_at         timestamp     not null default now(),
    refunded_at     timestamp     null,
    created_datetime      timestamp     not null default now(),

    constraint uk_payment_code unique (payment_code),
    constraint fk_payment_order_code foreign key (order_code)
        references tbl_order (order_code),
    constraint fk_payment_buyer foreign key (buyer_id)
        references tbl_member (id),
    constraint fk_payment_seller foreign key (seller_id)
        references tbl_member (id),
    constraint fk_payment_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_payment_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_payment_card foreign key (card_id)
        references tbl_card (id),
    constraint chk_payment_self check (buyer_id <> seller_id)
);

comment on table  tbl_payment                 is '결제';
comment on column tbl_payment.id              is 'PK';
comment on column tbl_payment.payment_code    is '결제번호 (O-OR...)';
comment on column tbl_payment.order_code      is '주문번호 (B-SN...)';
comment on column tbl_payment.buyer_id        is '구매자 FK';
comment on column tbl_payment.seller_id       is '판매자 FK';
comment on column tbl_payment.work_id         is '작품 FK';
comment on column tbl_payment.auction_id      is '경매 FK (경매 거래인 경우)';
comment on column tbl_payment.original_amount is '최초 결제금액';
comment on column tbl_payment.total_price     is '총 구매가';
comment on column tbl_payment.total_fee       is '총 수수료';
comment on column tbl_payment.payment_purpose is '결제 목적 (PURCHASE / DEPOSIT / BALANCE)';
comment on column tbl_payment.pay_method      is '결제 수단 (KAKAO_PAY / CARD 등)';
comment on column tbl_payment.card_id         is '사용 카드 FK';
comment on column tbl_payment.pg_receipt_id   is 'PG/부트페이 영수증 ID';
comment on column tbl_payment.status          is '상태 (PENDING/AUTHORIZED/COMPLETED/REFUNDED/CANCELLED)';
comment on column tbl_payment.paid_at         is '거래 일시';

create index idx_payment_order_code on tbl_payment (order_code);
create index idx_payment_buyer   on tbl_payment (buyer_id);
create index idx_payment_seller  on tbl_payment (seller_id);
create index idx_payment_work    on tbl_payment (work_id);
create index idx_payment_auction on tbl_payment (auction_id);


-- ----------------------------------------------------------
-- 40. 정산 (tbl_settlement)
-- ----------------------------------------------------------
drop table if exists tbl_settlement cascade;

create table tbl_settlement (
    id                 bigint generated always as identity primary key,
    payment_id         bigint        not null,
    member_id          bigint        not null,
    pre_tax_amount     int not null,
    total_deduction    int not null,
    net_amount         int not null,
    effective_tax_rate int  not null,
    status             varchar(255)   not null default 'PENDING',
    approved_at        timestamp     null,
    paid_at            timestamp     null,
    created_datetime         timestamp     not null default now(),
    updated_datetime         timestamp     not null default now(),

    constraint fk_settlement_payment foreign key (payment_id)
        references tbl_payment (id),
    constraint fk_settlement_member foreign key (member_id)
        references tbl_member (id)
);

comment on table  tbl_settlement                    is '정산';
comment on column tbl_settlement.id                 is 'PK';
comment on column tbl_settlement.payment_id         is '결제 FK';
comment on column tbl_settlement.member_id          is '수령인(판매자) FK';
comment on column tbl_settlement.pre_tax_amount     is '세전 정산금';
comment on column tbl_settlement.total_deduction    is '공제 합계';
comment on column tbl_settlement.net_amount         is '실수령 정산금';
comment on column tbl_settlement.effective_tax_rate is '실효세율 (%)';
comment on column tbl_settlement.status             is '상태 (PENDING/APPROVED/PAID/REJECTED)';
comment on column tbl_settlement.approved_at        is '승인 일시';
comment on column tbl_settlement.paid_at            is '지급 일시';

create index idx_settlement_payment on tbl_settlement (payment_id);
create index idx_settlement_member  on tbl_settlement (member_id);
create index idx_settlement_status  on tbl_settlement (status, created_datetime desc);



-- ----------------------------------------------------------
-- 41. 정산 공제 항목 (tbl_settlement_deduction)
-- ----------------------------------------------------------
drop table if exists tbl_settlement_deduction cascade;

create table tbl_settlement_deduction (
    id             bigint generated always as identity primary key,
    settlement_id  bigint        not null,
    deduction_name varchar(255)  not null,
    amount         int not null,
    sort_order     int       not null default 0,

    constraint fk_sd_settlement foreign key (settlement_id)
        references tbl_settlement (id)
);

comment on table  tbl_settlement_deduction                is '정산 공제 항목';
comment on column tbl_settlement_deduction.id             is 'PK';
comment on column tbl_settlement_deduction.settlement_id  is '정산 FK';
comment on column tbl_settlement_deduction.deduction_name is '공제 항목명';
comment on column tbl_settlement_deduction.amount         is '공제 금액';

create index idx_sd_settlement on tbl_settlement_deduction (settlement_id);


-- ----------------------------------------------------------
-- 44. 출금 요청 (tbl_withdrawal_request)
-- ----------------------------------------------------------
drop table if exists tbl_withdrawal_request cascade;

create table tbl_withdrawal_request (
    id                 bigint generated always as identity primary key,
    withdrawal_code    varchar(255)    not null,
    member_id          bigint          not null,
    settlement_id      bigint          null,
    requested_amount   int             not null,
    fee                int             not null default 0,
    net_amount         int             not null,
    status             varchar(255)    not null default 'PENDING',
    admin_id           bigint          null,
    rejected_reason    varchar(255)    null,
    requested_at       timestamp       not null default now(),
    approved_at        timestamp       null,
    paid_at            timestamp       null,
    created_datetime   timestamp       not null default now(),
    updated_datetime   timestamp       not null default now(),

    constraint uk_wr_code unique (withdrawal_code),
    constraint fk_wr_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_wr_settlement foreign key (settlement_id)
        references tbl_settlement (id),
    constraint fk_wr_admin foreign key (admin_id)
        references tbl_member (id),
    constraint chk_wr_status check (status in ('PENDING', 'APPROVED', 'REJECTED', 'PAID'))
);

comment on table  tbl_withdrawal_request                    is '출금 요청';
comment on column tbl_withdrawal_request.id                 is 'PK';
comment on column tbl_withdrawal_request.withdrawal_code    is '출금 요청 코드 (WDL-xxx)';
comment on column tbl_withdrawal_request.member_id          is '요청 회원 FK';
comment on column tbl_withdrawal_request.settlement_id      is '연관 정산 FK';
comment on column tbl_withdrawal_request.requested_amount   is '신청 금액';
comment on column tbl_withdrawal_request.fee                is '수수료';
comment on column tbl_withdrawal_request.net_amount         is '실수령액';
comment on column tbl_withdrawal_request.status             is '상태 (PENDING/APPROVED/REJECTED/PAID)';
comment on column tbl_withdrawal_request.admin_id           is '처리 관리자 FK';
comment on column tbl_withdrawal_request.rejected_reason    is '반려 사유';
comment on column tbl_withdrawal_request.requested_at       is '출금 요청 일시';
comment on column tbl_withdrawal_request.approved_at        is '승인 일시';
comment on column tbl_withdrawal_request.paid_at            is '지급 일시';

create index idx_wr_member on tbl_withdrawal_request (member_id);
create index idx_wr_status on tbl_withdrawal_request (status, requested_at desc);
create index idx_wr_settlement on tbl_withdrawal_request (settlement_id);


-- ----------------------------------------------------------
-- 21. 좋아요 (tbl_like)
-- ----------------------------------------------------------
drop table if exists tbl_like cascade;

create table tbl_like (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null,
    target_type varchar(255) not null,
    target_id   bigint      not null,
    created_datetime  timestamp   not null default now(),

    constraint uk_like unique (member_id, target_type, target_id),
    constraint fk_like_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_like is '좋아요';
comment on column tbl_like.id is 'PK';
comment on column tbl_like.member_id is '좋아요 한 회원';
comment on column tbl_like.target_type is '대상 타입 (WORK)';
comment on column tbl_like.target_id is '대상 PK';

create index idx_like_target on tbl_like (target_type, target_id);

-- tbl_work
ALTER TABLE tbl_work ALTER COLUMN price TYPE bigint;

-- tbl_contest
ALTER TABLE tbl_contest ALTER COLUMN price TYPE bigint;

-- tbl_order
ALTER TABLE tbl_order ALTER COLUMN original_price   TYPE bigint;
ALTER TABLE tbl_order ALTER COLUMN discount_amount  TYPE bigint;
ALTER TABLE tbl_order ALTER COLUMN fee_amount       TYPE bigint;
ALTER TABLE tbl_order ALTER COLUMN total_price      TYPE bigint;
ALTER TABLE tbl_order ALTER COLUMN deposit_amount   TYPE bigint;

-- tbl_payment
ALTER TABLE tbl_payment ALTER COLUMN original_amount TYPE bigint;
ALTER TABLE tbl_payment ALTER COLUMN total_price     TYPE bigint;
ALTER TABLE tbl_payment ALTER COLUMN total_fee       TYPE bigint;

-- tbl_settlement
ALTER TABLE tbl_settlement ALTER COLUMN pre_tax_amount  TYPE bigint;
ALTER TABLE tbl_settlement ALTER COLUMN total_deduction TYPE bigint;
ALTER TABLE tbl_settlement ALTER COLUMN net_amount      TYPE bigint;

-- tbl_settlement_deduction
ALTER TABLE tbl_settlement_deduction ALTER COLUMN amount TYPE bigint;

-- tbl_withdrawal_request
ALTER TABLE tbl_withdrawal_request ALTER COLUMN requested_amount TYPE bigint;
ALTER TABLE tbl_withdrawal_request ALTER COLUMN fee              TYPE bigint;
ALTER TABLE tbl_withdrawal_request ALTER COLUMN net_amount       TYPE bigint;