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
