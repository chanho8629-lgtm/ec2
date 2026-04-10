-- tbl_work
ALTER TABLE tbl_work ALTER COLUMN price TYPE bigint;

-- tbl_contest
ALTER TABLE tbl_contest ALTER COLUMN price TYPE bigint;

-- tbl_order
ALTER TABLE tbl_order ALTER COLUMN original_price   TYPE bigint;
ALTER TABLE tbl_order ALTER COLUMN discount_amount  TYPE bigint;
ALTER TABLE tbl_order ALTER COLUMN fee_amount       TYPE bigint;
ALTER TABLE tbl_order ALTER COLUMN total_price      TYPE bigint;
ALTER TABLE tbl_order ALTER COLUMN deposit_amount   TYPE bigint;

-- tbl_payment
ALTER TABLE tbl_payment ALTER COLUMN original_amount TYPE bigint;
ALTER TABLE tbl_payment ALTER COLUMN total_price     TYPE bigint;
ALTER TABLE tbl_payment ALTER COLUMN total_fee       TYPE bigint;

-- tbl_settlement
ALTER TABLE tbl_settlement ALTER COLUMN pre_tax_amount  TYPE bigint;
ALTER TABLE tbl_settlement ALTER COLUMN total_deduction TYPE bigint;
ALTER TABLE tbl_settlement ALTER COLUMN net_amount      TYPE bigint;

-- tbl_settlement_deduction
ALTER TABLE tbl_settlement_deduction ALTER COLUMN amount TYPE bigint;

-- tbl_withdrawal_request
ALTER TABLE tbl_withdrawal_request ALTER COLUMN requested_amount TYPE bigint;
ALTER TABLE tbl_withdrawal_request ALTER COLUMN fee              TYPE bigint;
ALTER TABLE tbl_withdrawal_request ALTER COLUMN net_amount       TYPE bigint;