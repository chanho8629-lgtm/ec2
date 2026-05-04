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
-- alter table tbl_inquiry add constraint chk_inquiry_status check (status in ('PENDING', 'ANSWERED', 'CLOSED'));
