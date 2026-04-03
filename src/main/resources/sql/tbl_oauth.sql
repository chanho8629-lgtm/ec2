-- ----------------------------------------------------------
-- OAuth 로그인 연동 (tbl_oauth)
-- ----------------------------------------------------------
drop table if exists tbl_oauth cascade;
drop type if exists oauth_provider cascade;

create type oauth_provider as enum('kakao', 'naver');

create table tbl_oauth
(
    id                  bigint generated always as identity primary key,
    member_id           bigint not null,
    provider            oauth_provider not null,
    provider_id         varchar(255) not null,
    connected_at        timestamp not null default now(),
    created_datetime    timestamp not null default now(),
    updated_datetime    timestamp not null default now(),
    deleted_datetime    timestamp null,

    constraint uk_oauth_provider unique (provider, provider_id),
    constraint uk_oauth_member_provider unique (member_id, provider),
    constraint fk_oauth_member foreign key (member_id) references tbl_member(id)
);

comment on table tbl_oauth is 'OAuth 로그인 연동';
comment on column tbl_oauth.id is 'OAuth 연동 번호 (PK)';
comment on column tbl_oauth.member_id is '회원 번호';
comment on column tbl_oauth.provider_id is '제공자 회원 번호';
comment on column tbl_oauth.provider is 'OAuth 제공자';
comment on column tbl_oauth.connected_at is '연동 일시';
comment on column tbl_oauth.created_datetime is '생성 일시';
comment on column tbl_oauth.updated_datetime is '수정 일시';
comment on column tbl_oauth.deleted_datetime is '탈퇴 일시 (soft delete)';
