"""
발표용 더미 데이터 생성 v3.
- 회원 300명 (한국형 닉네임)
- 작품 +300, 갤러리 +50, 경매 +50, 입찰/팔로우 추가
- 출력: seed_presentation_v3.sql 파일 (psql로 적용)
실행: python seed_presentation_v3.py
"""
import random
import os
from datetime import datetime, timedelta

random.seed(2026)

# --- 닉네임 단어 사전 ---
HAN_ADJ = [
    '달빛','별빛','새벽','노을','바람','구름','파도','꽃피는','조용한','따뜻한',
    '청춘','오늘도','어제의','내일의','첫번째','마지막','한가한','분주한','은은한','선명한',
    '여름밤','겨울밤','가을의','봄날의','한낮의','한밤의','초록','보라','회색','연두',
    '깊은','얕은','맑은','흐린','짙은','옅은','상쾌한','달콤한','쌉쌀한','쓸쓸한',
    '귀여운','용감한','수줍은','발랄한','차분한','시크한','자유로운','단정한','고요한','반짝이는',
]
HAN_NOUN = [
    '여우','고양이','곰','사슴','토끼','너구리','참새','거북이','다람쥐','수달',
    '필름','카메라','노트','펜슬','캔버스','스튜디오','갤러리','아틀리에','리뷰','콜렉션',
    '바다','산','숲','강','하늘','별','달','태양','구름','바람',
    '커피','라떼','홍차','마들렌','스콘','쿠키','케이크','크루아상','민트','레몬',
    '일기','감성','생각','기록','이야기','여행','산책','휴식','순간','풍경',
    '아침','저녁','오후','새벽','한낮','밤하늘','별밤','노을','일출','일몰',
]
ENG_PRE = [
    'kim','lee','park','choi','jung','han','seo','yoon','jin','min',
    'ari','suni','jiwoo','dahae','nayoung','seungwoo','soyeon','minjun','jisoo','hayoon',
    'mood','daily','film','studio','gallery','memo','soul','vibe','tone','frame',
    'soft','warm','cool','calm','bright','dark','silent','wild','urban','rustic',
]
ENG_POST = [
    'studio','works','film','art','lab','log','note','diary','daily','frames',
    'mood','vibe','space','hour','moment','light','room','place','life','tone',
]

# --- 한국형 real_name 풀 ---
SURNAMES = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','전','홍']
GIVEN_NAMES = [
    '서연','민준','지우','도윤','서윤','시우','하준','준서','지호','지안',
    '예준','지민','수아','하은','지유','채원','수빈','윤서','다은','시윤',
    '예나','은우','이서','연우','승현','수현','지현','민서','준호','태현',
    '재민','다현','유진','상우','동현','은서','시현','현우','민지','지원',
]


def gen_nick(used: set) -> str:
    """unique 닉네임 생성."""
    for _ in range(50):
        style = random.random()
        if style < 0.40:
            n = f"{random.choice(HAN_ADJ)}{random.choice(HAN_NOUN)}"
        elif style < 0.65:
            n = f"{random.choice(ENG_PRE)}_{random.choice(ENG_POST)}"
        elif style < 0.85:
            n = f"{random.choice(HAN_ADJ)}{random.choice(HAN_NOUN)}{random.randint(2, 99)}"
        else:
            n = f"{random.choice(ENG_PRE)}{random.randint(11, 999)}"
        if n not in used:
            used.add(n)
            return n
    n = f"user_{random.randint(10000, 99999)}"
    used.add(n)
    return n


def gen_real_name() -> str:
    return random.choice(SURNAMES) + random.choice(GIVEN_NAMES)


def gen_email(idx: int) -> str:
    return f"member{idx:04d}@bideo.test"


# --- 작품 카테고리 + 제목 시드 ---
CATEGORIES = [
    ('도시', ['새벽 종로', '비 오는 강남', '석양의 한강', '서울 야경', '광화문 광경', '홍대 거리', '명동 풍경', '한남 야경', '강북 골목', '청량리 새벽']),
    ('자연', ['설악 단풍', '동해 일출', '제주 유채', '한라산 풍경', '울릉도 해변', '담양 대숲', '내장산 단풍', '강원 폭포', '봄날 들판', '겨울 산정']),
    ('인물', ['소녀의 미소', '노부부 산책', '바리스타의 손', '엄마의 뒷모습', '아이의 눈빛', '연인의 그림자', '청년의 시선', '거리의 노래', '주인공의 옆모습', '오래된 친구']),
    ('추상', ['청록 그라데이션', '붉은 파동', '검은 기하학', '흰 여백', '노란 흐름', '보라 안개', '회색의 결', '코발트 사선', '핑크 리듬', '검은 동심원']),
    ('SF', ['네온 도시', '우주 정거장', '로봇과 인간', '사이버펑크', '미래 거리', '디지털 풍경', '메타버스', '홀로그램', '안드로이드', '시간의 균열']),
    ('동물', ['눈밭의 여우', '잠든 고양이', '비행하는 매', '들판의 사슴', '강가의 수달', '빛나는 반딧불', '물속 거북', '숲의 부엉이', '바다의 돌고래', '도심 비둘기']),
    ('음식', ['김치찌개', '베이커리 진열', '커피 한 잔', '비빔밥', '딸기 케이크', '라면 한 그릇', '회덮밥', '브런치 플레이트', '스시 모음', '와인 한 병']),
    ('건축', ['한옥 처마', '미니멀 콘크리트', '벽돌의 결', '돌담길', '유리 건물', '아치형 입구', '계단의 그림자', '회색 외벽', '돌탑 풍경', '낡은 창문']),
    ('야경', ['서울 야경', '별이 가득한 밤', '강변 야경', '도시의 불빛', '항구 야경', '광장의 밤', '거리의 가로등', '해안 야경', '밤하늘 별자리', '마천루 불빛']),
    ('일상', ['카페의 오후', '책상 위 노트북', '읽다 만 책', '오후의 햇살', '주방의 풍경', '식탁 위 꽃', '창가 화분', '아침 산책', '한낮의 휴식', '저녁 시간']),
    ('패션', ['겨울 코트', '여름 원피스', '봄 자켓', '가을 카디건', '데님 스타일', '미니멀 룩', '클래식 정장', '스니커즈', '액세서리', '비니와 머플러']),
    ('스포츠', ['결승선의 환호', '새벽 러닝', '서핑 보드', '농구 경기', '축구장 풍경', '요가 자세', '클라이밍', '자전거 라이딩', '수영장의 빛', '권투 글러브']),
    ('디자인', ['포스터 모음', '브랜드 로고', '책 표지', '패키지', '인포그래픽', '타이포', '아이콘 세트', 'UI 컴포넌트', '명함 디자인', '굿즈 시리즈']),
    ('일러스트', ['수채화 풍경', '드로잉 컬렉션', '캐릭터 시리즈', '판타지 세계', '여백의 미', '동화 일러스트', '컬러 스케치', '디지털 페인팅', '잉크 작품', '연필 드로잉']),
    ('포트폴리오', ['작업 기록', '연도별 선집', '시리즈 1', '시리즈 2', '대표작 모음', '클라이언트 워크', '개인 작업', '실험 시리즈', '컨셉북', '아카이브']),
]
TAGS_BY_CAT = {
    '도시': ['도시','거리','야경','서울','네온','빌딩','뒷골목','상점','지하철','광장'],
    '자연': ['자연','산','바다','꽃','단풍','일출','일몰','풍경','계절','초록'],
    '인물': ['인물','감성','일상','초상','웃음','뒷모습','시선','순간','연인','가족'],
    '추상': ['추상','패턴','색감','그라데이션','기하학','미니멀','디지털','구성','형태','빛'],
    'SF': ['SF','사이버펑크','네온','미래','우주','로봇','메타','홀로그램','시간','과학'],
    '동물': ['동물','반려','야생','새','고양이','강아지','곰','자연','순간','귀여움'],
    '음식': ['음식','카페','브런치','한식','디저트','커피','요리','맛집','컬러','스타일링'],
    '건축': ['건축','벽','문','창문','구조','곡선','한옥','모던','콘크리트','유리'],
    '야경': ['야경','빛','밤','별','네온','도시','거리','반사','광장','감성'],
    '일상': ['일상','감성','오후','휴식','평화','커피','책','창가','햇살','잔잔'],
    '패션': ['패션','스타일','코디','계절','룩','액세서리','신발','코트','원피스','모자'],
    '스포츠': ['스포츠','운동','러닝','경기','챌린지','피트니스','요가','클라이밍','수영','자전거'],
    '디자인': ['디자인','브랜드','타이포','로고','패키지','아이덴티티','컬러','구성','UI','그래픽'],
    '일러스트': ['일러스트','드로잉','수채화','캐릭터','판타지','잉크','연필','디지털페인팅','동화','컬러'],
    '포트폴리오': ['포트폴리오','작업','시리즈','아카이브','컨셉','컬렉션','대표작','선집','연도','클라이언트'],
}

# --- 출력 시작 ---
out_path = os.path.join(os.path.dirname(__file__), 'seed_presentation_v3.sql')
lines = []
add = lines.append

add("-- 발표용 더미 데이터 v3 (자동 생성)")
add("\\encoding UTF8")
add("BEGIN;")
add("")

# 1) 기존 회원 닉네임 update (test1~108) + real_name 부여
used_nicks = set()
add("-- 1. 기존 회원 닉네임 한국형으로 update")
for mid in range(1, 109):
    nick = gen_nick(used_nicks)
    rname = gen_real_name()
    add(f"update tbl_member set nickname='{nick}', real_name='{rname}' where id={mid};")
add("")

# 2) 신규 회원 +192 (id 109~300)
add("-- 2. 신규 회원 192명 추가")
add("insert into tbl_member (email, password, nickname, real_name, role, status) values")
rows = []
for idx in range(109, 301):
    nick = gen_nick(used_nicks)
    rname = gen_real_name()
    email = gen_email(idx)
    rows.append(f"  ('{email}', '$2a$10$dummyhashdummyhashdummyhashdu', '{nick}', '{rname}', 'USER', 'ACTIVE')")
add(",\n".join(rows) + ";")
add("")

# 3) 작품 +300
add("-- 3. 작품 300개 추가 (카테고리별 균등)")
add("insert into tbl_work (member_id, title, category, description, price, license_type, is_tradable, allow_comment, show_similar, view_count, like_count, save_count, comment_count, status, created_datetime) values")
work_rows = []
for _ in range(300):
    mid = random.randint(1, 300)
    cat, titles = random.choice(CATEGORIES)
    title = random.choice(titles) + ' #' + str(random.randint(1, 99))
    desc = f"{cat} 분위기를 담은 {title.split(' #')[0]} 작품. 색감과 디테일에 집중했습니다."
    price = random.choice([0, 0, 0, 5000, 10000, 20000, 50000, 100000])
    license_type = random.choice(['CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'COMMERCIAL', 'PERSONAL'])
    is_tradable = 'true' if random.random() < 0.4 else 'false'
    view = random.randint(20, 5000)
    like = random.randint(0, view // 5)
    save = random.randint(0, like // 2 + 1)
    comment = random.randint(0, 30)
    days_ago = random.randint(0, 365)
    created = (datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23))).strftime('%Y-%m-%d %H:%M:%S')
    title_esc = title.replace("'", "''")
    desc_esc = desc.replace("'", "''")
    work_rows.append(
        f"  ({mid}, '{title_esc}', '{cat}', '{desc_esc}', {price}, '{license_type}', "
        f"{is_tradable}, true, true, {view}, {like}, {save}, {comment}, 'ACTIVE', '{created}')"
    )
add(",\n".join(work_rows) + ";")
add("")

# 4) 갤러리 +50
add("-- 4. 갤러리 50개 추가")
add("insert into tbl_gallery (member_id, title, description, work_count, view_count, like_count, comment_count, status, created_datetime) values")
gal_rows = []
gal_titles_pool = [
    '나의 도시 일기','계절의 기록','감성 카탈로그','일상 아카이브','색감 컬렉션',
    '여행의 단상','별빛 모음집','사적인 풍경','조용한 시간','오후의 빛',
    '필름 큐레이션','감성 스튜디오','짧은 메모','반복되는 풍경','지난 봄의 기록',
    '비 내리는 날','한낮의 산책','밤의 거리','색의 정원','순간 포착',
]
for _ in range(50):
    mid = random.randint(1, 300)
    title = random.choice(gal_titles_pool) + ' vol.' + str(random.randint(1, 12))
    desc = f"작가 본인이 큐레이션한 시리즈. 일상의 시선이 담겨 있다."
    work_count = random.randint(3, 18)
    view = random.randint(50, 8000)
    like = random.randint(0, view // 4)
    comment = random.randint(0, 25)
    days_ago = random.randint(0, 365)
    created = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
    title_esc = title.replace("'", "''")
    gal_rows.append(
        f"  ({mid}, '{title_esc}', '{desc}', {work_count}, {view}, {like}, {comment}, 'ACTIVE', '{created}')"
    )
add(",\n".join(gal_rows) + ";")
add("")

# 5) 경매 +50
add("-- 5. 경매 50개 추가")
add("""insert into tbl_auction (work_id, seller_id, asking_price, starting_price, bid_increment, current_price, bid_count, fee_rate, fee_amount, settlement_amount, deadline_hours, started_at, closing_at, status, winner_id, final_price)
select w.id, w.member_id,
       sp * 2, sp,
       greatest(sp / 10, 1000),
       case when state = 'CLOSED' then sp * (1 + (random() * 3)::int)
            when state = 'ACTIVE' then sp + (random() * sp)::int
            else sp end,
       case when state = 'CLOSED' then 5 + (random() * 30)::int
            when state = 'ACTIVE' then (random() * 10)::int
            else 0 end,
       0.10,
       0,
       0,
       hours,
       now() - (random() * interval '60 days'),
       case when state = 'CLOSED' then now() - (random() * interval '20 days')
            else now() + (hours::text || ' hours')::interval end,
       state,
       case when state = 'CLOSED' then (1 + (random() * 299)::int) else null end,
       case when state = 'CLOSED' then sp * (1 + (random() * 3)::int) else null end
  from (
    select w.id, w.member_id,
           greatest(w.price, 10000) as sp,
           24 + (random() * 168)::int as hours,
           (array['ACTIVE','ACTIVE','ACTIVE','CLOSED','CLOSED'])[1 + (random() * 4)::int] as state
      from tbl_work w
      where w.deleted_datetime is null and w.status='ACTIVE'
        and w.id not in (select work_id from tbl_auction)
      order by random()
      limit 50
  ) w;""")
add("")

# 6) 입찰 추가 (1000여건)
add("-- 6. 입찰 1000여건 추가 (활성/마감 경매에 분산)")
add("""insert into tbl_bid (auction_id, member_id, bid_price, is_winning, created_datetime)
select a.id,
       1 + (random() * 299)::int,
       a.starting_price + ((random() * a.starting_price * 3)::int),
       false,
       a.started_at + (random() * (least(now(), a.closing_at) - a.started_at))
  from tbl_auction a
  cross join generate_series(1, 12 + (random() * 18)::int)
  where a.bid_count > 0;""")
add("update tbl_bid set is_winning = false;")
add("""update tbl_bid b
   set is_winning = true
  from (
    select distinct on (auction_id) id, auction_id
      from tbl_bid
     order by auction_id, bid_price desc, id desc
  ) top
 where b.id = top.id;""")
add("")

# 7) 팔로우 +1000 (시간 분산: 최근 90일)
add("-- 7. 팔로우 1000건 추가 (최근 90일 시간 분산)")
add("""insert into tbl_follow (follower_id, following_id, created_datetime)
select f, fl, now() - (random() * interval '90 days')
  from (
    select 1 + (random() * 299)::int as f,
           1 + (random() * 299)::int as fl
      from generate_series(1, 1500)
  ) raw
 where f <> fl
on conflict (follower_id, following_id) do nothing;""")
add("")

# 8) 비정규화 카운트 갱신
add("-- 8. 비정규화 카운트 sync")
add("""update tbl_member m
   set follower_count = coalesce(c.cnt, 0)
  from (select following_id, count(*) cnt from tbl_follow group by following_id) c
 where m.id = c.following_id;""")
add("""update tbl_member m
   set following_count = coalesce(c.cnt, 0)
  from (select follower_id, count(*) cnt from tbl_follow group by follower_id) c
 where m.id = c.follower_id;""")
add("""update tbl_member m
   set gallery_count = coalesce(c.cnt, 0)
  from (select member_id, count(*) cnt from tbl_gallery where deleted_datetime is null group by member_id) c
 where m.id = c.member_id;""")
add("""update tbl_auction a
   set bid_count = coalesce(b.cnt, 0),
       current_price = coalesce(b.max_price, a.starting_price)
  from (select auction_id, count(*) cnt, max(bid_price) max_price from tbl_bid group by auction_id) b
 where a.id = b.auction_id;""")
add("")

add("COMMIT;")

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'생성 완료: {out_path}')
print(f'  라인 수: {len(lines):,}')
