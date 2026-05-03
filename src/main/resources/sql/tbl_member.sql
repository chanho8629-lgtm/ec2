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

-- member

-- membertags-meta

insert into tbl_member (
    email,
    password,
    nickname,
    real_name,
    bio,
    role,
    creator_verified,
    seller_verified,
    creator_tier,
    follower_count,
    following_count,
    gallery_count,
    phone_number,
    last_login_datetime,
    status,
    created_datetime,
    updated_datetime
) values
      ('test1@bideo.com', 'test1', 'test1', '테스트1', '더미 회원 1', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0001', now(), 'ACTIVE', now(), now()),
      ('test2@bideo.com', 'test2', 'test2', '테스트2', '더미 회원 2', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0002', now(), 'ACTIVE', now(), now()),
      ('test3@bideo.com', 'test3', 'test3', '테스트3', '더미 회원 3', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0003', now(), 'ACTIVE', now(), now()),
      ('test4@bideo.com', 'test4', 'test4', '테스트4', '더미 회원 4', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0004', now(), 'ACTIVE', now(), now()),
      ('test5@bideo.com', 'test5', 'test5', '테스트5', '더미 회원 5', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0005', now(), 'ACTIVE', now(), now()),
      ('test6@bideo.com', 'test6', 'test6', '테스트6', '더미 회원 6', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0006', now(), 'ACTIVE', now(), now()),
      ('test7@bideo.com', 'test7', 'test7', '테스트7', '더미 회원 7', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0007', now(), 'ACTIVE', now(), now()),
      ('test8@bideo.com', 'test8', 'test8', '테스트8', '더미 회원 8', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0008', now(), 'ACTIVE', now(), now()),
      ('test9@bideo.com', 'test9', 'test9', '테스트9', '더미 회원 9', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0009', now(), 'ACTIVE', now(), now()),
      ('test10@bideo.com', 'test10', 'test10', '테스트10', '더미 회원 10', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0010', now(), 'ACTIVE', now(), now()),
      ('test11@bideo.com', 'test11', 'test11', '테스트11', '더미 회원 11', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0011', now(), 'ACTIVE', now(), now()),
      ('test12@bideo.com', 'test12', 'test12', '테스트12', '더미 회원 12', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0012', now(), 'ACTIVE', now(), now()),
      ('test13@bideo.com', 'test13', 'test13', '테스트13', '더미 회원 13', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0013', now(), 'ACTIVE', now(), now()),
      ('test14@bideo.com', 'test14', 'test14', '테스트14', '더미 회원 14', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0014', now(), 'ACTIVE', now(), now()),
      ('test15@bideo.com', 'test15', 'test15', '테스트15', '더미 회원 15', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0015', now(), 'ACTIVE', now(), now()),
      ('test16@bideo.com', 'test16', 'test16', '테스트16', '더미 회원 16', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0016', now(), 'ACTIVE', now(), now()),
      ('test17@bideo.com', 'test17', 'test17', '테스트17', '더미 회원 17', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0017', now(), 'ACTIVE', now(), now()),
      ('test18@bideo.com', 'test18', 'test18', '테스트18', '더미 회원 18', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0018', now(), 'ACTIVE', now(), now()),
      ('test19@bideo.com', 'test19', 'test19', '테스트19', '더미 회원 19', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0019', now(), 'ACTIVE', now(), now()),
      ('test20@bideo.com', 'test20', 'test20', '테스트20', '더미 회원 20', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0020', now(), 'ACTIVE', now(), now()),
      ('test21@bideo.com', 'test21', 'test21', '테스트21', '더미 회원 21', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0021', now(), 'ACTIVE', now(), now()),
      ('test22@bideo.com', 'test22', 'test22', '테스트22', '더미 회원 22', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0022', now(), 'ACTIVE', now(), now()),
      ('test23@bideo.com', 'test23', 'test23', '테스트23', '더미 회원 23', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0023', now(), 'ACTIVE', now(), now()),
      ('test24@bideo.com', 'test24', 'test24', '테스트24', '더미 회원 24', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0024', now(), 'ACTIVE', now(), now()),
      ('test25@bideo.com', 'test25', 'test25', '테스트25', '더미 회원 25', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0025', now(), 'ACTIVE', now(), now()),
      ('test26@bideo.com', 'test26', 'test26', '테스트26', '더미 회원 26', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0026', now(), 'ACTIVE', now(), now()),
      ('test27@bideo.com', 'test27', 'test27', '테스트27', '더미 회원 27', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0027', now(), 'ACTIVE', now(), now()),
      ('test28@bideo.com', 'test28', 'test28', '테스트28', '더미 회원 28', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0028', now(), 'ACTIVE', now(), now()),
      ('test29@bideo.com', 'test29', 'test29', '테스트29', '더미 회원 29', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0029', now(), 'ACTIVE', now(), now()),
      ('test30@bideo.com', 'test30', 'test30', '테스트30', '더미 회원 30', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0030', now(), 'ACTIVE', now(), now()),
      ('test31@bideo.com', 'test31', 'test31', '테스트31', '더미 회원 31', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0031', now(), 'ACTIVE', now(), now()),
      ('test32@bideo.com', 'test32', 'test32', '테스트32', '더미 회원 32', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0032', now(), 'ACTIVE', now(), now()),
      ('test33@bideo.com', 'test33', 'test33', '테스트33', '더미 회원 33', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0033', now(), 'ACTIVE', now(), now()),
      ('test34@bideo.com', 'test34', 'test34', '테스트34', '더미 회원 34', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0034', now(), 'ACTIVE', now(), now()),
      ('test35@bideo.com', 'test35', 'test35', '테스트35', '더미 회원 35', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0035', now(), 'ACTIVE', now(), now()),
      ('test36@bideo.com', 'test36', 'test36', '테스트36', '더미 회원 36', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0036', now(), 'ACTIVE', now(), now()),
      ('test37@bideo.com', 'test37', 'test37', '테스트37', '더미 회원 37', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0037', now(), 'ACTIVE', now(), now()),
      ('test38@bideo.com', 'test38', 'test38', '테스트38', '더미 회원 38', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0038', now(), 'ACTIVE', now(), now()),
      ('test39@bideo.com', 'test39', 'test39', '테스트39', '더미 회원 39', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0039', now(), 'ACTIVE', now(), now()),
      ('test40@bideo.com', 'test40', 'test40', '테스트40', '더미 회원 40', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0040', now(), 'ACTIVE', now(), now()),
      ('test41@bideo.com', 'test41', 'test41', '테스트41', '더미 회원 41', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0041', now(), 'ACTIVE', now(), now()),
      ('test42@bideo.com', 'test42', 'test42', '테스트42', '더미 회원 42', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0042', now(), 'ACTIVE', now(), now()),
      ('test43@bideo.com', 'test43', 'test43', '테스트43', '더미 회원 43', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0043', now(), 'ACTIVE', now(), now()),
      ('test44@bideo.com', 'test44', 'test44', '테스트44', '더미 회원 44', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0044', now(), 'ACTIVE', now(), now()),
      ('test45@bideo.com', 'test45', 'test45', '테스트45', '더미 회원 45', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0045', now(), 'ACTIVE', now(), now()),
      ('test46@bideo.com', 'test46', 'test46', '테스트46', '더미 회원 46', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0046', now(), 'ACTIVE', now(), now()),
      ('test47@bideo.com', 'test47', 'test47', '테스트47', '더미 회원 47', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0047', now(), 'ACTIVE', now(), now()),
      ('test48@bideo.com', 'test48', 'test48', '테스트48', '더미 회원 48', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0048', now(), 'ACTIVE', now(), now()),
      ('test49@bideo.com', 'test49', 'test49', '테스트49', '더미 회원 49', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0049', now(), 'ACTIVE', now(), now()),
      ('test50@bideo.com', 'test50', 'test50', '테스트50', '더미 회원 50', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0050', now(), 'ACTIVE', now(), now()),
      ('test51@bideo.com', 'test51', 'test51', '테스트51', '더미 회원 51', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0051', now(), 'ACTIVE', now(), now()),
      ('test52@bideo.com', 'test52', 'test52', '테스트52', '더미 회원 52', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0052', now(), 'ACTIVE', now(), now()),
      ('test53@bideo.com', 'test53', 'test53', '테스트53', '더미 회원 53', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0053', now(), 'ACTIVE', now(), now()),
      ('test54@bideo.com', 'test54', 'test54', '테스트54', '더미 회원 54', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0054', now(), 'ACTIVE', now(), now()),
      ('test55@bideo.com', 'test55', 'test55', '테스트55', '더미 회원 55', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0055', now(), 'ACTIVE', now(), now()),
      ('test56@bideo.com', 'test56', 'test56', '테스트56', '더미 회원 56', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0056', now(), 'ACTIVE', now(), now()),
      ('test57@bideo.com', 'test57', 'test57', '테스트57', '더미 회원 57', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0057', now(), 'ACTIVE', now(), now()),
      ('test58@bideo.com', 'test58', 'test58', '테스트58', '더미 회원 58', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0058', now(), 'ACTIVE', now(), now()),
      ('test59@bideo.com', 'test59', 'test59', '테스트59', '더미 회원 59', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0059', now(), 'ACTIVE', now(), now()),
      ('test60@bideo.com', 'test60', 'test60', '테스트60', '더미 회원 60', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0060', now(), 'ACTIVE', now(), now()),
      ('test61@bideo.com', 'test61', 'test61', '테스트61', '더미 회원 61', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0061', now(), 'ACTIVE', now(), now()),
      ('test62@bideo.com', 'test62', 'test62', '테스트62', '더미 회원 62', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0062', now(), 'ACTIVE', now(), now()),
      ('test63@bideo.com', 'test63', 'test63', '테스트63', '더미 회원 63', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0063', now(), 'ACTIVE', now(), now()),
      ('test64@bideo.com', 'test64', 'test64', '테스트64', '더미 회원 64', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0064', now(), 'ACTIVE', now(), now()),
      ('test65@bideo.com', 'test65', 'test65', '테스트65', '더미 회원 65', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0065', now(), 'ACTIVE', now(), now()),
      ('test66@bideo.com', 'test66', 'test66', '테스트66', '더미 회원 66', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0066', now(), 'ACTIVE', now(), now()),
      ('test67@bideo.com', 'test67', 'test67', '테스트67', '더미 회원 67', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0067', now(), 'ACTIVE', now(), now()),
      ('test68@bideo.com', 'test68', 'test68', '테스트68', '더미 회원 68', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0068', now(), 'ACTIVE', now(), now()),
      ('test69@bideo.com', 'test69', 'test69', '테스트69', '더미 회원 69', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0069', now(), 'ACTIVE', now(), now()),
      ('test70@bideo.com', 'test70', 'test70', '테스트70', '더미 회원 70', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0070', now(), 'ACTIVE', now(), now()),
      ('test71@bideo.com', 'test71', 'test71', '테스트71', '더미 회원 71', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0071', now(), 'ACTIVE', now(), now()),
      ('test72@bideo.com', 'test72', 'test72', '테스트72', '더미 회원 72', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0072', now(), 'ACTIVE', now(), now()),
      ('test73@bideo.com', 'test73', 'test73', '테스트73', '더미 회원 73', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0073', now(), 'ACTIVE', now(), now()),
      ('test74@bideo.com', 'test74', 'test74', '테스트74', '더미 회원 74', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0074', now(), 'ACTIVE', now(), now()),
      ('test75@bideo.com', 'test75', 'test75', '테스트75', '더미 회원 75', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0075', now(), 'ACTIVE', now(), now()),
      ('test76@bideo.com', 'test76', 'test76', '테스트76', '더미 회원 76', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0076', now(), 'ACTIVE', now(), now()),
      ('test77@bideo.com', 'test77', 'test77', '테스트77', '더미 회원 77', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0077', now(), 'ACTIVE', now(), now()),
      ('test78@bideo.com', 'test78', 'test78', '테스트78', '더미 회원 78', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0078', now(), 'ACTIVE', now(), now()),
      ('test79@bideo.com', 'test79', 'test79', '테스트79', '더미 회원 79', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0079', now(), 'ACTIVE', now(), now()),
      ('test80@bideo.com', 'test80', 'test80', '테스트80', '더미 회원 80', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0080', now(), 'ACTIVE', now(), now()),
      ('test81@bideo.com', 'test81', 'test81', '테스트81', '더미 회원 81', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0081', now(), 'ACTIVE', now(), now()),
      ('test82@bideo.com', 'test82', 'test82', '테스트82', '더미 회원 82', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0082', now(), 'ACTIVE', now(), now()),
      ('test83@bideo.com', 'test83', 'test83', '테스트83', '더미 회원 83', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0083', now(), 'ACTIVE', now(), now()),
      ('test84@bideo.com', 'test84', 'test84', '테스트84', '더미 회원 84', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0084', now(), 'ACTIVE', now(), now()),
      ('test85@bideo.com', 'test85', 'test85', '테스트85', '더미 회원 85', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0085', now(), 'ACTIVE', now(), now()),
      ('test86@bideo.com', 'test86', 'test86', '테스트86', '더미 회원 86', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0086', now(), 'ACTIVE', now(), now()),
      ('test87@bideo.com', 'test87', 'test87', '테스트87', '더미 회원 87', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0087', now(), 'ACTIVE', now(), now()),
      ('test88@bideo.com', 'test88', 'test88', '테스트88', '더미 회원 88', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0088', now(), 'ACTIVE', now(), now()),
      ('test89@bideo.com', 'test89', 'test89', '테스트89', '더미 회원 89', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0089', now(), 'ACTIVE', now(), now()),
      ('test90@bideo.com', 'test90', 'test90', '테스트90', '더미 회원 90', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0090', now(), 'ACTIVE', now(), now()),
      ('test91@bideo.com', 'test91', 'test91', '테스트91', '더미 회원 91', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0091', now(), 'ACTIVE', now(), now()),
      ('test92@bideo.com', 'test92', 'test92', '테스트92', '더미 회원 92', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0092', now(), 'ACTIVE', now(), now()),
      ('test93@bideo.com', 'test93', 'test93', '테스트93', '더미 회원 93', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0093', now(), 'ACTIVE', now(), now()),
      ('test94@bideo.com', 'test94', 'test94', '테스트94', '더미 회원 94', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0094', now(), 'ACTIVE', now(), now()),
      ('test95@bideo.com', 'test95', 'test95', '테스트95', '더미 회원 95', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0095', now(), 'ACTIVE', now(), now()),
      ('test96@bideo.com', 'test96', 'test96', '테스트96', '더미 회원 96', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0096', now(), 'ACTIVE', now(), now()),
      ('test97@bideo.com', 'test97', 'test97', '테스트97', '더미 회원 97', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0097', now(), 'ACTIVE', now(), now()),
      ('test98@bideo.com', 'test98', 'test98', '테스트98', '더미 회원 98', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0098', now(), 'ACTIVE', now(), now()),
      ('test99@bideo.com', 'test99', 'test99', '테스트99', '더미 회원 99', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0099', now(), 'ACTIVE', now(), now()),
      ('test100@bideo.com', 'test100', 'test100', 'test100', '더미 회원 100', 'USER', false, false, 'BASIC', 0, 0, 0, '010-1000-0100', now(), 'ACTIVE', now(), now()),
      ('chanho8629@gmail.com', 'qweasd', 'user1', '유저1', '지정 계정 1', 'USER', false, false, 'BASIC', 0, 0, 0, '01095883420', now(), 'ACTIVE', now(), now()),
      ('tmdals8277@gmail.com', 'qweasd', 'user2', '유저2', '지정 계정 2', 'USER', false, false, 'BASIC', 0, 0, 0, '01073672151', now(), 'ACTIVE', now(), now())
on conflict do nothing;
