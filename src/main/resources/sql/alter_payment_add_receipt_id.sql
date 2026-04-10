alter table tbl_payment
    add column if not exists receipt_id varchar(255);

comment on column tbl_payment.receipt_id is '부트페이 영수증 ID';
