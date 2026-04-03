-- ----------------------------------------------------------
-- 15. 검색 이력 (tbl_search_history)
-- ----------------------------------------------------------
drop table if exists tbl_search_history cascade;

create table tbl_search_history (
    id          bigint generated always as identity primary key,
    member_id   bigint       not null,
    keyword     varchar(255) not null,
    searched_at timestamp    not null default now(),

    constraint fk_sh_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_search_history is '검색 이력';
comment on column tbl_search_history.id is 'PK';
comment on column tbl_search_history.member_id is '회원 FK';
comment on column tbl_search_history.keyword is '검색 키워드';
comment on column tbl_search_history.searched_at is '검색 일시';

create index idx_sh_member on tbl_search_history (member_id, searched_at desc);
create index idx_sh_searched_at on tbl_search_history (searched_at);
