-- ----------------------------------------------------------
-- 1. 회원 (tbl_member)
-- ----------------------------------------------------------
create table tbl_member
(
    id                  bigint generated always as identity primary key,
    email               varchar(255) not null,
    password            varchar(255) null,
    nickname            varchar(255) not null,
    real_name           varchar(255) null,
    birth_date          date         null,
    bio                 varchar(255) null,
    banner_image        varchar(255) null,
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

drop table if exists tbl_member cascade;

comment on table tbl_member is '회원';
comment on column tbl_member.id is '회원 번호 (PK)';
comment on column tbl_member.email is '이메일 (로그인 + 아이디찾기)';
comment on column tbl_member.password is '비밀번호 (bcrypt, 소셜전용은 NULL)';
comment on column tbl_member.nickname is '닉네임';
comment on column tbl_member.real_name is '실명';
comment on column tbl_member.birth_date is '생년월일';
comment on column tbl_member.bio is '자기소개';
comment on column tbl_member.banner_image is '프로필 배너 이미지 URL';
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
