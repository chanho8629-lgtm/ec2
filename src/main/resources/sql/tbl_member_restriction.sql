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
