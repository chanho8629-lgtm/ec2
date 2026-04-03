-- ----------------------------------------------------------
-- 24. 댓글 좋아요 (tbl_comment_like)
-- ----------------------------------------------------------
drop table if exists tbl_comment_like cascade;

create table tbl_comment_like (
    id              bigint generated always as identity primary key,
    comment_id      bigint    not null,
    member_id       bigint    not null,
    created_datetime      timestamp not null default now(),

    constraint uk_comment_like unique (comment_id, member_id),
    constraint fk_cl_comment foreign key (comment_id)
        references tbl_comment (id),
    constraint fk_cl_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_comment_like is '댓글 좋아요';
comment on column tbl_comment_like.id is 'PK';

create index idx_cl_member on tbl_comment_like (member_id);
