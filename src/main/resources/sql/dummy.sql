\encoding UTF8

-- member
drop extension if exists pgcrypto cascade;
insert into tbl_member (
    email,
    password,
    nickname,
    real_name,
    bio,
    role,
    creator_verified,
    seller_verified,
    creator_tier,
    follower_count,
    following_count,
    gallery_count,
    phone_number,
    last_login_datetime,
    status,
    created_datetime,
    updated_datetime
)
select
    'test' || gs || '@bideo.com' as email,
    case gs
        when 1 then '$2a$10$1MzgFJAu5Ybc8XwfZOUCK.85VnbgqOqDU/3umAPwteebE4J.poDf6'
        when 2 then '$2a$10$LSPSIsItqGNuhd8kks1F2eaTuJeZT3K9OxLFzSuqM5XAdan72HU8a'
        when 3 then '$2a$10$n/C4nKvgodcKNrMrGhsAhOnid7mpbjoDeZ71Ypix8qAnhdFwpsplK'
        when 4 then '$2a$10$DTkPSO1msaKm9Lp42EG2vOuuSJyeKhv2IBPmYYKJVCAqRsAqjd8fW'
        when 5 then '$2a$10$3bW9ln/RlbzuO1KRYTZxROykuzYOOIQjudUap6kldsUGivN0zWCIK'
        when 6 then '$2a$10$G0S3ows8GeSm3HlEzd.LGuIHRx/9QctJw/SkuAy9Oof.P.6GX104m'
        when 7 then '$2a$10$.xPwRy1rtxRBLQmI3fhQTuvP08bQTQtKff13ZNk8wDHeVKwEipinC'
        when 8 then '$2a$10$5YrKQzj4lI7QhykTYrdspuxDh.hDrrFPDwIbfpihE8.Zk0FO0G1ji'
        when 9 then '$2a$10$DaBqM8q0WGFOaL91Xbh2i.8YnnCvVkzxs4/F4RfgMthgjhGqJBJMG'
        when 10 then '$2a$10$w4IWqGKCWor/bxKVwUuWc.b20T0oF7mTRr9vHGo.n03XQG4vHnEta'
        when 11 then '$2a$10$ASPz/zMe/9NvCGkjPSVJ8O53D7HtG/OiT3mqLwe45YUBnsba.fKw.'
        when 12 then '$2a$10$Ad7M9ZbaNtNb9K2CSCXf/OVkvgLKBPmVKldthMy5DSfhTX.6K.Q7i'
        when 13 then '$2a$10$OTqpCTDpFxG8LaJtoLa9xeZ/AGB0XEptjcK9PfQKK8KDFZ3pKBBPK'
        when 14 then '$2a$10$EFdUCne4aasr32Boi47h6elJkOzCV.Bb4vpAhC7BfjEu.MXvagUlS'
        when 15 then '$2a$10$uD1wnnRN91ZRAHRB31yk3ODmd3MoHoK1L0Hksysxmtzrksg.fa9Ja'
        when 16 then '$2a$10$/kvPkTlO7WD6NwubpgKjm.YB7KSAKWHv80aS/yxP2ZLmixV3xZNZ6'
        when 17 then '$2a$10$gk9GC0MBwUneuoQkTo21FuMAXdnT6NiWgqFt/1GXlvdDiUEWowJbG'
        when 18 then '$2a$10$c3Hvkucx73WNv2SsdsX.F.o2IsCNtrpEubOxHSIM/zxpCJnf1JiXu'
        when 19 then '$2a$10$8FnRVomvuWeAFeKD2QLOoug9Fd5RLUY3eWRRALhpLpG9AxCs5S4qm'
        when 20 then '$2a$10$NOpPl6VFJHJHyX5QAmcCregdp0tnjn7erPiMecDvNBUOrVJqdvVZm'
        when 21 then '$2a$10$QDAjrXiRo3SVd0SCYRNkfuZCUfLYTadLyc6KntgXGXPYTSe31XmzG'
        when 22 then '$2a$10$jelEn6imj/BxBmx1lGkQZOR0GDUV21716PdWsCiRpgT4qj/20DgEi'
        when 23 then '$2a$10$G86Rz5rZqN3Cv40TZ3v0zeObO9br8wgsSuNr5ei5PzYDB/8SCXOZC'
        when 24 then '$2a$10$krEebGxqE.rRbxLaF1rx0eWpSftZdLq7ev2iwuGVEpY6/FWYwZbzK'
        when 25 then '$2a$10$C3TxAvw6h.ihq5CcvrjSmeyTh1oLjZYg3r.R2iU828oJp58BCBQfK'
        when 26 then '$2a$10$VrREmiBOa1A9qa/qTn3gQuQ9Yh/zGMEAF7IP48JnFgioF5zXyFEem'
        when 27 then '$2a$10$hr6Dm1VXyO5RfGpfybEqA.YlV3lx.IEe3wT8iKfj.UiQLtWvHYK5q'
        when 28 then '$2a$10$6gshZWiYB8yosBTj7qfmaet7mpN/cIIzFzdOWFqiHNtKlZvEb.QwC'
        when 29 then '$2a$10$a9kT6sUxKMvUPHnoxqDJq.8tS0yc8ADBoEHm2K8AGhVibvYKgaMBy'
        when 30 then '$2a$10$4Ola9M9mD7Pc00.daFNqwuqD1xEMTjDGHWU68FKSTomEZpIaGxErO'
        when 31 then '$2a$10$cq9CiQ5PSpAh./Pr1rlYfOpfmnOLbmhbfJL//5uN9Qe3VjjJrJrPK'
        when 32 then '$2a$10$J8yZJOruMNTB8v12Am3.N.JzlsF6HrSXe1y9kG0OElfeD7y/4DUxm'
        when 33 then '$2a$10$Yv.VN8BMhjS3q6Cu4muen.hIeu0EzdpwdBduiy4gH54/aki6oSan6'
        when 34 then '$2a$10$J6LP2saFjT7JSkw0R..dDeOVo44.5S.OJBMsPJOodNXVAacJOGMFG'
        when 35 then '$2a$10$/13MjWPld/ubpqm5gZFeUepnny8Y8idc3JVZsSAApLi6A6ckID56.'
        when 36 then '$2a$10$KDoGbkCKBIxgWMgCz1QGXuw3ywwcr64BoagpDAPBYnvnnVvAS7hc.'
        when 37 then '$2a$10$JtDCYGIB1LLzgBCjKZEKR.iSJeec/IHkjPUjKtHZONpgq2Y/NMmTK'
        when 38 then '$2a$10$CxZuaFIlKVIF2INaYvuPveWeqz2NutsEValfzuBdP2.Z/lM9N/AA6'
        when 39 then '$2a$10$9wNl6wj763bmXT2F6W3KQOvvRVTN1H9VZaO.GBrCwKsoPnOsPDIfK'
        when 40 then '$2a$10$2QPdLk344CMN4k.sQbkkX.jQ12qwdhYyBlc45looyKBorugTGiHHy'
        when 41 then '$2a$10$YDleomvjvzQKgu6kO2Rd5.HYVK0ftK5gHSn/qhpx2sHJqyG0TF2ZW'
        when 42 then '$2a$10$U2Oe5JTzXG5GQlAFgEAml.PLlm9W8M4GnEzlZsRQCndP08hKdA752'
        when 43 then '$2a$10$wCHd6IZQIYm.tMK1U.W2eeG2xd4dKeTInLr0TgWw6DhOMBQ2gMZCO'
        when 44 then '$2a$10$XiONmzm3WIuMVgDaMGE4lOakfWkCLxXl3XbDX1Lth5crlyqctgsBq'
        when 45 then '$2a$10$hBXC3mYof9j/tmwSfobiquoyq9tAIS/qCArjyKqvN/PeOWb2KJ.Na'
        when 46 then '$2a$10$p0.SqTxmGtyOQbTfxB0oyu4p6rco71jWTs8z5pckqfjbTRlccWph6'
        when 47 then '$2a$10$sC0puB6NRrjZEc8jILjcQ.o0Dbqacc/iMvcCadReHJf4Hx7wRsXqi'
        when 48 then '$2a$10$rmj.16WcJ5V5bvnBarEGI.2zAsnR0YXfp7cufgRw.PMtQ5wV6ubNC'
        when 49 then '$2a$10$3DAuQ4kZzRjTn0veXSYL8.CmJhs318H9yWLFhiUVbqxp2TX/J1yz.'
        when 50 then '$2a$10$pwImMuJ7rCYBHAWlX8Es8.NZUzFQ7tet1vAhqmNCbrkEyhfHrfuQm'
        when 51 then '$2a$10$E5.vYonJpt1LlhaRU7OUCOTsw8fE5D6DNHUKeVOP.kxq.i0Hjfe/K'
        when 52 then '$2a$10$oDS480HQfgk1VHfN8zR3EeJ5jj.bzVrBLgLpE0Y1ccZiTmfBypaDK'
        when 53 then '$2a$10$0IRuFAURS7eIqMaMcCnluu4SXJZBtocE3ejzD93mdNAfK1wo.VOoG'
        when 54 then '$2a$10$KGc.9104VXAnwDmjumwU2.tvaKwePNslqKbP1Su5lrq6uf9y554hu'
        when 55 then '$2a$10$eMjOCKPrw6TOU0b9Ufa6YuZVn/o8zAMBNbRvj1aJQUp81fDANiqeq'
        when 56 then '$2a$10$FyGf3xNI3c/pdWB/Ph7lTOA2Y.wujYxPkZZlcTh6svbU9OU9JoxAa'
        when 57 then '$2a$10$8cRbHDdl0.8Xo9wMUIZLCuKkJc6G/Xfru4KkKi2tiPQJbMIyhWsGu'
        when 58 then '$2a$10$mjwCIBKre9d2yVvgyU5qN.oAwe0pZtFYa9jGAnEotcfT0eskbSYEK'
        when 59 then '$2a$10$ENkkO81fmahMhHUwCTGhWOJcFskxBH8i6YUdUGd/9A/XITm8yoL2K'
        when 60 then '$2a$10$XhqvtTsIybM92I3EwkS4vuW3Gm937O60iiNUp/wrkZX..Suz986Pi'
        when 61 then '$2a$10$VMK77OkNDDUN5sID3mTIZ.xXXn8vhdfSKvq3vsocjrArbOIHZNvWm'
        when 62 then '$2a$10$Zfe4TUGqKjMSDIoUkoQYK.ThhbGYG8.c9C2w64fT6kQxrPpevdWOO'
        when 63 then '$2a$10$dQYiyJM7EPQexc1LhaNS0OXOMUekmiKKx9gMwxulYJ2ppMPidlENK'
        when 64 then '$2a$10$AV0V6CerZdU1LZ4GAsqkGO5.D6tO6ICzgIM1By4gG.upSb86Dt1LG'
        when 65 then '$2a$10$UpzSlRegtZe1lG6OPjaWheL8T.9t9PFJmQOONgzj3hkRszMuXCuSS'
        when 66 then '$2a$10$Bqzwp1hy8oCZTkvocyQX8eMHJfx9xv80/4jTQPSdtUoyvpZ9JgnNq'
        when 67 then '$2a$10$RrrjVUTGDzOBLB4jVdfi3.7waAqFg7U4fZNQvmu21Kg.tdoSiWhLy'
        when 68 then '$2a$10$ev2oBGznDiW.Q7mQfvrecu2ORtU54RIvDW8XhLPqW/sahimGA2gNG'
        when 69 then '$2a$10$ZqVv0DLrdwipa8qyZ9mxFeCV6FRXTYVdUjNYwe/H8/wtMMh/YSGVa'
        when 70 then '$2a$10$OcLEBpuOr8ICSYR0f4.r.eDzcz9jW8QzrVO4lz9zZcuoxi/nv28oi'
        when 71 then '$2a$10$9TCahtErhcXUn1vvxM1hH.ErahpCKPCOIjLi8jlJhCr3u99umPP3m'
        when 72 then '$2a$10$vYBmpAa6e8rQ3rmbQZ3DOOLBi8TlGfyG3lxEGWxXz5TJ71tgt0gPm'
        when 73 then '$2a$10$Cw0VIPXpBLcPoZdN2L1mxOxj/279e.anLoW/jjUiwioFXiulvudPC'
        when 74 then '$2a$10$yqAHYYiDF/WjkYuHo5ueJ.mN3iGCayGLRKJp.VXrFbQHjvS1S/OD2'
        when 75 then '$2a$10$8AD6KJceBLaAMjQRHSEu.OeGPaOhYxJR2.EG06S6m0FAsz9wj8WOK'
        when 76 then '$2a$10$gMznSMXEbn085jUzlILeL.a2otfI1WG9T.1/aE8hjFcZ30zZDHdeK'
        when 77 then '$2a$10$K0pWJPHBfIP1ngR9Tc9oY.OAdu90mAOQdJu1O5intQuDVjsZ5GQa6'
        when 78 then '$2a$10$.YGSrD1YJRhDLNRHAHGJB.4y5yZDeRAzczrPp.P.yBA60IhI4yZPy'
        when 79 then '$2a$10$LJ.mqE/VCuJkENE0yaGEw.h7ZcGKaWjVPUpJl7tXOIw5AhDTkc9D.'
        when 80 then '$2a$10$.ByAHPtnnwkRvvG0fMoxHu4eML.jwOyKYHZrBIvIiTBFIccPnDQ9i'
        when 81 then '$2a$10$aW6siMmC9ZgLBNq3HvOle.VCXG92hCfYshiqeSzWC0qhMv5TKPM3C'
        when 82 then '$2a$10$ZJmTiJJOaZ4Z8bhFHRHQ9OkFBcrKxjiwsnh1b0GV27JouUPZDpDL.'
        when 83 then '$2a$10$kP0L5DDyZ.mREkjpVxtEJeqOVxCNcGKHHvHKPI4AUkm7yrL1cEUpC'
        when 84 then '$2a$10$RQzwIDJMh0RmvX76zgg6Y.IvsstXWl8g8um9CNCHj97TbuXyO8x9.'
        when 85 then '$2a$10$iRSb41MMhIXQ1XUKFytQCeb7xrB1hOEA13T9g1JXF28r70p86pojq'
        when 86 then '$2a$10$bjR.hdMr/UWNe6UzSebKruFgo39bbp9HGeGWaC4coE.nSxVmxKvJO'
        when 87 then '$2a$10$5Q5JgzTPiDllvTtAdG9g6uSUUYooeQ8bIF6SbT3PVVsjTch2pdTE6'
        when 88 then '$2a$10$ckqk02Mf0QAEcrgFawZMWebDQUigN7QFHNu1r06MxnmgNWogjEUya'
        when 89 then '$2a$10$xYHHDWkCB.D4eAFIZZXAZ.gKvq6dbJrPuviM0Ip5iOhjkgDPqUO/O'
        when 90 then '$2a$10$sc7k2ZIHXDCRz9mm5ucXB.fQq1RBPQ8DZU1I411vn06m2ytGGFBmK'
        when 91 then '$2a$10$/KAy7vCP3rfK9KJYWSZrHeSKYCg1Nz9BkDs0/UiRwxWBlQMcgZBXW'
        when 92 then '$2a$10$IVngK5RJrQY4yvSdTyA1g.hq3rFMb6mAGUV2ziBrs1hKUveVC0NoS'
        when 93 then '$2a$10$wc71reJxZ6wmHRwPXGG55u7RN9U0HgY0.R06NMYLZEaR0eTOq3h7S'
        when 94 then '$2a$10$sNeVbVAEIUDtEBqnOXuE8ethx0TuN/uYxwXe8izaTiUf9JpKHTWEa'
        when 95 then '$2a$10$eRCssGTkT0AiMbtEcdtqre9pYOkn4woOCVRV6wKyoQ3lRvoWHkRO6'
        when 96 then '$2a$10$I51SfQrDmx6BOQm2sO3tueCOswarWoF/DyF4.k/zRbPFw74m8O5RK'
        when 97 then '$2a$10$veM4O26r1mrh4dIiNt.66OW1/F0qA2QBzljwcXVfo687dpYR4iXgy'
        when 98 then '$2a$10$dPQEz5EL46OJnY0BZ.84.OhcFVax/9kenedmVmMrC7.p0Ku9KFPMW'
        when 99 then '$2a$10$YlH1q6fe2KUzBO7o.HRnIu4WsWoy.nV96f3b7kmFN30XTGPzw7vx.'
        when 100 then '$2a$10$X9mg3VtBN.vrlp8ZCS2TXel.SMi5nTWTgqGQLylRb3Kzdn2ioaIaW'
    end as password,
    'test' || gs as nickname,
    '테스트' || gs as real_name,
    '더미 회원 ' || gs as bio,
    'USER' as role,
    false as creator_verified,
    false as seller_verified,
    'BASIC' as creator_tier,
    0 as follower_count,
    0 as following_count,
    0 as gallery_count,
    '010-1000-' || lpad(gs::text, 4, '0') as phone_number,
    now() as last_login_datetime,
    'ACTIVE' as status,
    now() as created_datetime,
    now() as updated_datetime
from generate_series(1, 100) as gs
on conflict (email) do update
set
    password = excluded.password,
    nickname = excluded.nickname,
    real_name = excluded.real_name,
    bio = excluded.bio,
    role = excluded.role,
    creator_verified = excluded.creator_verified,
    seller_verified = excluded.seller_verified,
    creator_tier = excluded.creator_tier,
    follower_count = excluded.follower_count,
    following_count = excluded.following_count,
    gallery_count = excluded.gallery_count,
    phone_number = excluded.phone_number,
    last_login_datetime = excluded.last_login_datetime,
    status = excluded.status,
    updated_datetime = now();

insert into tbl_member (
    email,
    password,
    nickname,
    real_name,
    bio,
    role,
    creator_verified,
    seller_verified,
    creator_tier,
    follower_count,
    following_count,
    gallery_count,
    phone_number,
    last_login_datetime,
    status,
    created_datetime,
    updated_datetime
)
values (
    'dlwnstn0315@gmail.com',
    '$2b$10$J34V9sWoEokz6k6NhZtAxe2QYEGXHsZ4L/N.RaJDmHnQlZZXGdUO6',
    'dlwnstn0315',
    'dlwnstn0315',
    '추가 더미 회원',
    'USER',
    false,
    false,
    'BASIC',
    0,
    0,
    0,
    '010-9397-3256',
    now(),
    'ACTIVE',
    now(),
    now()
)
on conflict (email) do update
set
    password = excluded.password,
    nickname = excluded.nickname,
    real_name = excluded.real_name,
    bio = excluded.bio,
    role = excluded.role,
    creator_verified = excluded.creator_verified,
    seller_verified = excluded.seller_verified,
    creator_tier = excluded.creator_tier,
    follower_count = excluded.follower_count,
    following_count = excluded.following_count,
    gallery_count = excluded.gallery_count,
    phone_number = excluded.phone_number,
    last_login_datetime = excluded.last_login_datetime,
    status = excluded.status,
    updated_datetime = now();

-- gallery/work dummy data

drop table if exists tmp_dummy_gallery_seed;
drop table if exists tmp_dummy_galleries;
drop table if exists tmp_dummy_works;

create temporary table tmp_dummy_gallery_seed as
select
    id as member_id,
    cast(substring(email from 'test([0-9]+)@') as int) as gallery_no
from tbl_member
where email ~ E'^test([1-9][0-9]?|100)@bideo\\.com$';

delete from tbl_work_file
where work_id in (
    select id
    from tbl_work
    where title like '[DUMMY] 작품 G%-W%'
);

delete from tbl_gallery_work
where gallery_id in (
    select id
    from tbl_gallery
    where title like '[DUMMY] 예술관 %'
)
   or work_id in (
    select id
    from tbl_work
    where title like '[DUMMY] 작품 G%-W%'
);

delete from tbl_work
where title like '[DUMMY] 작품 G%-W%';

delete from tbl_gallery
where title like '[DUMMY] 예술관 %';

create temporary table tmp_dummy_galleries as
with inserted_galleries as (
    insert into tbl_gallery (
        member_id,
        title,
        description,
        cover_image,
        allow_comment,
        show_similar,
        work_count,
        like_count,
        comment_count,
        view_count,
        status,
        created_datetime,
        updated_datetime
    )
    select
        member_id,
        '[DUMMY] 예술관 ' || gallery_no,
        '더미 예술관 ' || gallery_no || ' 설명입니다.',
        'https://picsum.photos/seed/dummy-gallery-' || gallery_no || '/1200/675',
        true,
        true,
        0,
        (gallery_no % 25),
        0,
        100 + gallery_no,
        'EXHIBITING',
        now() - ((101 - gallery_no) * interval '1 day'),
        now()
    from tmp_dummy_gallery_seed
    order by gallery_no
    returning id, member_id, title
)
select
    id,
    member_id,
    cast(substring(title from E'\\[DUMMY\\] 예술관 ([0-9]+)') as int) as gallery_no
from inserted_galleries;

create temporary table tmp_dummy_works as
with inserted_works as (
    insert into tbl_work (
        member_id,
        title,
        category,
        description,
        price,
        license_type,
        license_terms,
        is_tradable,
        allow_comment,
        show_similar,
        link_url,
        view_count,
        like_count,
        save_count,
        comment_count,
        status,
        created_datetime,
        updated_datetime
    )
    select
        g.member_id,
        '[DUMMY] 작품 G' || g.gallery_no || '-W' || w.work_no,
        case mod(w.work_no, 4)
            when 0 then 'PHOTO'
            when 1 then 'DIGITAL_ART'
            when 2 then 'ILLUST'
            else 'VIDEO'
        end,
        '더미 예술관 ' || g.gallery_no || '의 작품 ' || w.work_no || ' 설명입니다.',
        10000 * (g.gallery_no + w.work_no),
        case mod(w.work_no, 3)
            when 0 then 'PERSONAL'
            when 1 then 'COMMERCIAL'
            else 'EXCLUSIVE'
        end,
        '더미 라이선스 조건',
        true,
        true,
        true,
        'https://example.com/dummy/gallery/' || g.gallery_no || '/work/' || w.work_no,
        (g.gallery_no * 10) + w.work_no,
        (g.gallery_no + w.work_no) % 40,
        (g.gallery_no + w.work_no) % 20,
        0,
        'ACTIVE',
        now() - (((101 - g.gallery_no) * 10 + w.work_no) * interval '1 hour'),
        now()
    from tmp_dummy_galleries g
    cross join lateral (
        select generate_series(1, 5 + mod(g.gallery_no - 1, 11)) as work_no
    ) w
    order by g.gallery_no, w.work_no
    returning id, member_id, title
)
select
    id,
    member_id,
    cast(substring(title from 'G([0-9]+)-W([0-9]+)') as int) as gallery_no,
    cast(substring(title from 'W([0-9]+)$') as int) as work_no
from inserted_works;

insert into tbl_gallery_work (
    gallery_id,
    work_id,
    sort_order,
    added_at
)
select
    g.id,
    w.id,
    w.work_no,
    now()
from tmp_dummy_galleries g
join tmp_dummy_works w
  on g.gallery_no = w.gallery_no
order by g.gallery_no, w.work_no;

insert into tbl_work_file (
    work_id,
    file_url,
    file_type,
    file_size,
    width,
    height,
    sort_order,
    created_datetime
)
select
    id,
    'https://picsum.photos/seed/dummy-work-' || gallery_no || '-' || work_no || '/1920/1080',
    'IMAGE',
    2097152 + (work_no * 1024),
    1920,
    1080,
    0,
    now()
from tmp_dummy_works
order by gallery_no, work_no;

update tbl_gallery g
set
    work_count = coalesce((
        select count(*)
        from tbl_gallery_work gw
        join tbl_work w on gw.work_id = w.id
        where gw.gallery_id = g.id
          and w.deleted_datetime is null
          and w.status != 'DELETED'
    ), 0),
    updated_datetime = now()
where g.id in (
    select id
    from tmp_dummy_galleries
);

update tbl_member m
set
    gallery_count = coalesce((
        select count(*)
        from tbl_gallery g
        where g.member_id = m.id
          and g.deleted_datetime is null
          and g.status != 'DELETED'
    ), 0),
    updated_datetime = now()
where m.id in (
    select member_id
    from tmp_dummy_gallery_seed
);

drop table if exists tmp_dummy_works;
drop table if exists tmp_dummy_galleries;
drop table if exists tmp_dummy_gallery_seed;

update tbl_badge
set image_file = case badge_key
    when 'FIRST_WORK' then 'first_video_badge.png'
    when 'WORK_10' then 'uploaded_more_than_5_times_badge.png'
    when 'WORK_50' then 'uploaded_more_than_5_times_badge.png'
    when 'FIRST_SALE' then 'first_sell_badge.png'
    when 'FIRST_AUCTION' then 'first_auction_winner_badge.png'
    when 'GALLERY_CREATOR' then 'art_gallery_views_over_10_million.png'
    when 'CONTEST_WINNER' then 'contest_award_badge.png'
    when 'FOLLOWER_100' then 'write_contest_badge.png'
    when 'EARLY_ADOPTER' then 'auction_price_of_1_million_won_badge.png'
    else image_file
end
where badge_key in (
    'FIRST_WORK',
    'WORK_10',
    'WORK_50',
    'FIRST_SALE',
    'FIRST_AUCTION',
    'GALLERY_CREATOR',
    'CONTEST_WINNER',
    'FOLLOWER_100',
    'EARLY_ADOPTER'
);

insert into tbl_member_badge (member_id, badge_id, is_displayed, earned_at)
select
    m.id,
    b.id,
    case
        when b.badge_key in ('FIRST_WORK', 'FIRST_SALE') then true
        else false
    end,
    now() - (row_number() over (partition by m.id order by b.id) * interval '1 day')
from tbl_member m
join tbl_badge b
  on b.badge_key in ('FIRST_WORK', 'WORK_10', 'FIRST_SALE')
where m.email in (
    'admin@bideo.com',
    'test1@bideo.com',
    'test2@bideo.com',
    'test3@bideo.com',
    'dlwnstn0315@gmail.com'
)
on conflict (member_id, badge_id) do update
set
    is_displayed = excluded.is_displayed,
    earned_at = excluded.earned_at;
