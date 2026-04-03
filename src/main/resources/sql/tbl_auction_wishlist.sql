-- ----------------------------------------------------------
-- 38. 경매 찜 (tbl_auction_wishlist)
-- ----------------------------------------------------------
drop table if exists tbl_auction_wishlist cascade;

create table tbl_auction_wishlist (
    id         bigint generated always as identity primary key,
    auction_id bigint    not null,
    member_id  bigint    not null,
    created_datetime timestamp not null default now(),

    constraint uk_auction_wish unique (auction_id, member_id),
    constraint fk_aw_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_aw_member foreign key (member_id)
        references tbl_member (id)
);

comment on table  tbl_auction_wishlist                     is '경매 찜';
comment on column tbl_auction_wishlist.id is 'PK';

create index idx_aw_member on tbl_auction_wishlist (member_id);
