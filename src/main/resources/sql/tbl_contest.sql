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