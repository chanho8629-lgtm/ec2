-- ----------------------------------------------------------
-- 23. 댓글 (tbl_comment)
-- ----------------------------------------------------------
drop table if exists tbl_comment cascade;

create table tbl_comment (
    id          bigint generated always as identity primary key,
    member_id   bigint       not null,
    target_type varchar(255)  not null,
    target_id   bigint       not null,
    parent_id   bigint       null,
    content     varchar(255) not null,
    is_pinned   boolean      not null default false,
    like_count  int      not null default 0,
    created_datetime  timestamp    not null default now(),
    updated_datetime  timestamp    not null default now(),
    deleted_datetime  timestamp    null,

    constraint fk_comment_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_comment_parent foreign key (parent_id)
        references tbl_comment (id)
);

comment on table tbl_comment is '댓글';
comment on column tbl_comment.id is 'PK';
comment on column tbl_comment.member_id is '작성자 FK';
comment on column tbl_comment.target_type is '대상 타입 (WORK / GALLERY)';
comment on column tbl_comment.target_id is '대상 PK';
comment on column tbl_comment.parent_id is '부모 댓글 (대댓글)';
comment on column tbl_comment.content is '댓글 내용';
comment on column tbl_comment.is_pinned is '고정 여부';
comment on column tbl_comment.like_count is '좋아요 수 (비정규화)';
comment on column tbl_comment.deleted_datetime is '삭제 일시 (soft delete)';

create index idx_comment_target on tbl_comment (target_type, target_id, created_datetime);
create index idx_comment_member on tbl_comment (member_id);
create index idx_comment_parent on tbl_comment (parent_id);

