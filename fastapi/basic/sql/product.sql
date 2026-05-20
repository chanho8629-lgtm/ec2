create table tbl_product(
    id bigint generated always as identity primary key,
    product_name varchar(255) not null,
    product_price int default 0,
    created_datetime timestamp default now(),
    updated_datetime timestamp default now()
);

select * from tbl_product;

