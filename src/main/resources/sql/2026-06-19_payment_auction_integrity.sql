-- 경매 최고 입찰과 Bootpay 영수증의 중복 상태를 정리한 뒤
-- DB 레벨에서 동일 상태가 다시 생성되지 않도록 보호한다.

with ranked_winners as (
    select id,
           row_number() over (
               partition by auction_id
               order by bid_price desc, created_datetime desc, id desc
           ) as winner_rank
    from tbl_bid
    where is_winning = true
)
update tbl_bid b
set is_winning = false
from ranked_winners r
where b.id = r.id
  and r.winner_rank > 1;

create unique index if not exists ux_bid_one_winner_per_auction
    on tbl_bid (auction_id)
    where is_winning = true;

with duplicated_receipts as (
    select id,
           row_number() over (
               partition by pg_receipt_id
               order by paid_at asc nulls last, created_datetime asc, id asc
           ) as receipt_rank
    from tbl_payment
    where pg_receipt_id is not null
)
update tbl_payment p
set pg_receipt_id = null
from duplicated_receipts r
where p.id = r.id
  and r.receipt_rank > 1;

create unique index if not exists ux_payment_pg_receipt
    on tbl_payment (pg_receipt_id)
    where pg_receipt_id is not null;
