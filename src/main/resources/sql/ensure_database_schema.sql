select pg_advisory_lock(20260520);

select case
    when to_regclass('public.tbl_member') is not null
     and to_regclass('public.tbl_work') is not null
    then 'true'
    else 'false'
end as core_schema_ready
\gset

\if :core_schema_ready
  \echo Core tables exist. Ensuring auction tables only.
  \i /sql/2026-05-20_create_missing_auction_tables.sql
\else
  \echo Core tables are missing. Initializing full database schema.
  \i /sql/create_all_tables.sql
\endif

select
    to_regclass('public.tbl_member') as tbl_member,
    to_regclass('public.tbl_work') as tbl_work,
    to_regclass('public.tbl_auction') as tbl_auction;

select pg_advisory_unlock(20260520);
