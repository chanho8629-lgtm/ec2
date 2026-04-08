select * from tbl_member;

select * from tbl_

update tbl_member
set role = 'ADMIN'
where email = 'test@gmail.com';

update tbl_member
set status = 'ACTIVE'
where email = 'test@gmail.com';

select setval
(
               pg_get_serial_s
               equence('tbl_member', 'id'),
               100
);