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

