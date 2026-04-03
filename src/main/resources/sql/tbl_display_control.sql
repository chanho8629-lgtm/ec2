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
