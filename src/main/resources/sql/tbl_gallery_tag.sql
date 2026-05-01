-- ----------------------------------------------------------
-- 32. 예술관 태그 (tbl_gallery_tag)
-- ----------------------------------------------------------
drop table if exists tbl_gallery_tag cascade;

create table tbl_gallery_tag (
    id             bigint generated always as identity primary key,
    gallery_id     bigint    not null,
    tag_id         bigint    not null,

    constraint uk_gallery_tag unique (gallery_id, tag_id),
    constraint fk_gt_gallery foreign key (gallery_id)
    references tbl_gallery (id),
    constraint fk_gt_tag foreign key (tag_id)
    references tbl_tag (id)
);

comment on table  tbl_gallery_tag                is '예술관 태그';
comment on column tbl_gallery_tag.id             is 'PK';

create index idx_gt_tag on tbl_gallery_tag (tag_id);

select * from tbl_gallery_tag;

INSERT INTO tbl_tag (tag_name) VALUES
                                   ('브이로그'), ('영화리뷰'), ('게임하이라이트'), ('먹방'), ('ASMR'),
                                   ('데일리메이크업'), ('뉴스하이라이트'), ('예능레전드'), ('음악추천'), ('직캠'),
                                   ('플레이리스트'), ('운동루틴'), ('홈트레이닝'), ('여행로그'), ('언박싱'),
                                   ('제품리뷰'), ('전자기기'), ('애플리뷰'), ('갤럭시리뷰'), ('요리레시피'),
                                   ('베이킹'), ('반려동물'), ('강아지'), ('고양이'), ('귀여운영상'),
                                   ('동기부여'), ('자기계발'), ('재테크'), ('주식분석'), ('부동산정보'),
                                   ('비트코인'), ('IT트렌드'), ('코딩강좌'), ('인공지능'), ('과학실험'),
                                   ('역사이야기'), ('미스터리'), ('공포실화'), ('공부방송'), ('집중음악'),
                                   ('명상'), ('심리학'), ('육아꿀팁'), ('인테리어'), ('랜선집들이'),
                                   ('패션하울'), ('룩북'), ('코디추천'), ('쇼츠'), ('릴스'),
                                   ('틱톡챌린지'), ('애니메이션'), ('웹툰리뷰'), ('영화예고편'), ('드라마몰아보기'),
                                   ('넷플릭스추천'), ('디즈니플러스'), ('스포츠분석'), ('축구하이라이트'), ('야구레전드'),
                                   ('농구'), ('골프레슨'), ('낚시'), ('캠핑'), ('차박'),
                                   ('자동차시승기'), ('모빌리티'), ('다큐멘터리'), ('인터뷰'), ('토크쇼'),
                                   ('라이브커머스'), ('홈쇼핑'), ('세일정보'), ('무대영상'), ('커버댄스'),
                                   ('보컬커버'), ('악기연주'), ('기타레슨'), ('피아노연주'), ('작곡'),
                                   ('미술강좌'), ('드로잉'), ('DIY'), ('수공예'), ('사진보정'),
                                   ('영상편집'), ('프리미어프로'), ('포토샵꿀팁'), ('메타버스'), ('VR게임'),
                                   ('공포게임'), ('롤하이라이트'), ('배그'), ('마인크래프트'), ('심즈'),
                                   ('인디게임'), ('모바일게임'), ('콘솔게임'), ('스팀게임'), ('e스포츠');


INSERT IGNORE INTO tbl_gallery_tag (gallery_id, tag_id)
SELECT 1, id FROM tbl_tag LIMIT 100;

-- 2. 다시 100개 몰아넣기 (1번 갤러리에 1~100번 태그 연결)
INSERT INTO tbl_gallery_tag (gallery_id, tag_id)
SELECT 1, id FROM tbl_tag LIMIT 100;