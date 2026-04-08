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

select * from tbl_report;