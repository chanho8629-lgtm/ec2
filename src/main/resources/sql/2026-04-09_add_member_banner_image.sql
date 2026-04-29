alter table tbl_member
    add column if not exists banner_image varchar(255) null;

comment on column tbl_member.banner_image is '프로필 배너 이미지 URL';
