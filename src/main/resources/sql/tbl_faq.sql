-- ----------------------------------------------------------
-- 5. FAQ (tbl_faq)
-- ----------------------------------------------------------
drop table if exists tbl_faq cascade;

create table tbl_faq (
    id         bigint generated always as identity primary key,
    question   varchar(255) not null,
    answer     text         not null,
    category   varchar(255)  null,
    sort_order int      not null default 0,
    is_active  boolean      not null default true,
    created_datetime timestamp    not null default now(),
    updated_datetime timestamp    not null default now()
);

comment on table tbl_faq is 'FAQ';
comment on column tbl_faq.id is 'PK';
comment on column tbl_faq.question is '질문';
comment on column tbl_faq.answer is '답변';
comment on column tbl_faq.category is '카테고리';

create index idx_faq_category on tbl_faq (category, is_active, sort_order);

