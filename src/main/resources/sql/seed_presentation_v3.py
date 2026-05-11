"""
AI 학습용 대용량 더미 데이터 생성 v3 (확장판).

전제 조건:
  1. create_all_tables.sql (스키마)
  2. seed_badge.sql (뱃지)
  3. seed_admin_dummy.sql (admin 1명 + 회원 100명(id 2~101) + 작품 100개(id 1~100) +
                          경매 100건(id 1~100) + 주문/결제/정산/출금/신고/문의)
  ↑ 위 3단계 이후 본 스크립트가 실행한 SQL을 적용.

생성 규모(대략):
  - 회원      : +5,000     (id 102~5,101)
  - 작품      : +20,000    (id 101~20,100)
  - 갤러리    : +2,000
  - 경매      : +3,000     (id 101~3,100)
  - 입찰      : ~50,000
  - 팔로우    : ~100,000
  - 작품좋아요: ~200,000
  - 갤러리좋아요: ~30,000
  - 북마크    : ~80,000
  - 댓글      : ~40,000
  - 작품조회  : ~300,000

사용법:
  python seed_presentation_v3.py
  psql -U bideo -d bideo -f seed_presentation_v3.sql
"""
import os
import random
from datetime import datetime, timedelta

random.seed(2026)

# ------------------------------------------------------------------
# 규모 파라미터 (필요 시 위에서 조정)
# ------------------------------------------------------------------
NEW_MEMBERS = 5_000
NEW_WORKS = 20_000
NEW_GALLERIES = 2_000
NEW_AUCTIONS = 3_000
BIDS_PER_AUCTION_MIN = 8
BIDS_PER_AUCTION_MAX = 20
FOLLOW_ATTEMPTS = 150_000           # ON CONFLICT 으로 일부 중복 제거
WORK_LIKE_ATTEMPTS = 300_000
GALLERY_LIKE_ATTEMPTS = 45_000
BOOKMARK_ATTEMPTS = 120_000
COMMENT_COUNT = 40_000
WORK_VIEW_COUNT = 300_000
NEW_CONTESTS = 60                   # 공모전

# admin_dummy 가 만들어둔 id 한계
ADMIN_MEMBERS_MAX_ID = 101          # admin(1) + qa001~100
ADMIN_WORKS_MAX_ID = 100
ADMIN_AUCTIONS_MAX_ID = 100

TOTAL_MEMBERS = ADMIN_MEMBERS_MAX_ID + NEW_MEMBERS               # 5101
TOTAL_WORKS = ADMIN_WORKS_MAX_ID + NEW_WORKS                     # 20100
TOTAL_AUCTIONS = ADMIN_AUCTIONS_MAX_ID + NEW_AUCTIONS            # 3100

INSERT_BATCH = 1_000                # 한 INSERT 문에 들어갈 row 수

# ------------------------------------------------------------------
# 닉네임 / 실명 단어 사전
# ------------------------------------------------------------------
HAN_ADJ = [
    '달빛','별빛','새벽','노을','바람','구름','파도','꽃피는','조용한','따뜻한',
    '청춘','오늘도','어제의','내일의','첫번째','마지막','한가한','분주한','은은한','선명한',
    '여름밤','겨울밤','가을의','봄날의','한낮의','한밤의','초록','보라','회색','연두',
    '깊은','얕은','맑은','흐린','짙은','옅은','상쾌한','달콤한','쌉쌀한','쓸쓸한',
    '귀여운','용감한','수줍은','발랄한','차분한','시크한','자유로운','단정한','고요한','반짝이는',
    '낭만적인','감각적인','몽환적인','담백한','산뜻한','진중한','부드러운','거친','매끄러운','투명한',
]
HAN_NOUN = [
    '여우','고양이','곰','사슴','토끼','너구리','참새','거북이','다람쥐','수달',
    '필름','카메라','노트','펜슬','캔버스','스튜디오','갤러리','아틀리에','리뷰','콜렉션',
    '바다','산','숲','강','하늘','별','달','태양','구름','바람',
    '커피','라떼','홍차','마들렌','스콘','쿠키','케이크','크루아상','민트','레몬',
    '일기','감성','생각','기록','이야기','여행','산책','휴식','순간','풍경',
    '아침','저녁','오후','새벽','한낮','밤하늘','별밤','노을','일출','일몰',
    '도화지','연필','잉크','수채','파스텔','조각','색감','구도','명도','채도',
]
ENG_PRE = [
    'kim','lee','park','choi','jung','han','seo','yoon','jin','min',
    'ari','suni','jiwoo','dahae','nayoung','seungwoo','soyeon','minjun','jisoo','hayoon',
    'mood','daily','film','studio','gallery','memo','soul','vibe','tone','frame',
    'soft','warm','cool','calm','bright','dark','silent','wild','urban','rustic',
    'noir','retro','neo','pixel','glow','flux','echo','drift','prism','aura',
]
ENG_POST = [
    'studio','works','film','art','lab','log','note','diary','daily','frames',
    'mood','vibe','space','hour','moment','light','room','place','life','tone',
    'haus','craft','press','kits','grid','core','ink','dust','beat','line',
]

SURNAMES = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','전','홍']
GIVEN_NAMES = [
    '서연','민준','지우','도윤','서윤','시우','하준','준서','지호','지안',
    '예준','지민','수아','하은','지유','채원','수빈','윤서','다은','시윤',
    '예나','은우','이서','연우','승현','수현','지현','민서','준호','태현',
    '재민','다현','유진','상우','동현','은서','시현','현우','민지','지원',
    '나윤','주원','시아','한별','다인','윤재','선우','지웅','다율','채은',
]

# ------------------------------------------------------------------
# 작품 카테고리 + 제목 시드 (학습 신호 다양성을 위해 확장)
# ------------------------------------------------------------------
CATEGORIES = [
    ('도시', ['새벽 종로','비 오는 강남','석양의 한강','서울 야경','광화문 광경','홍대 거리','명동 풍경','한남 야경','강북 골목','청량리 새벽',
              '성수동 풍경','을지로 야경','북촌 한옥','이태원 거리','상수동 골목','연남동 카페','부산 야경','대구 새벽','광주 야경','전주 한옥']),
    ('자연', ['설악 단풍','동해 일출','제주 유채','한라산 풍경','울릉도 해변','담양 대숲','내장산 단풍','강원 폭포','봄날 들판','겨울 산정',
              '오대산 새벽','지리산 운해','마라도 해안','한탄강 풍경','속초 백사장','남해 다랭이논','경주 벚꽃','선유도 일몰','순천 갈대','곰배령 야생화']),
    ('인물', ['소녀의 미소','노부부 산책','바리스타의 손','엄마의 뒷모습','아이의 눈빛','연인의 그림자','청년의 시선','거리의 노래','주인공의 옆모습','오래된 친구',
              '예술가의 손','거울 앞의 나','웃는 동생','지나가는 사람들','첫 출근','외할머니의 부엌','시장의 상인','거리의 음악가','신호등 앞','버스 정류장']),
    ('추상', ['청록 그라데이션','붉은 파동','검은 기하학','흰 여백','노란 흐름','보라 안개','회색의 결','코발트 사선','핑크 리듬','검은 동심원',
              '쪽빛 직조','오렌지 파편','블록 구성','색의 진동','얽힌 곡선','이중 구조','반복의 미','대비와 조화','매끈한 면','흩어진 점']),
    ('SF', ['네온 도시','우주 정거장','로봇과 인간','사이버펑크','미래 거리','디지털 풍경','메타버스','홀로그램','안드로이드','시간의 균열',
            '에어 카','데이터 폭우','우주선 격납고','AI 도시','가상 현실','크롬 거리','블랙홀','외계 행성','전자 유니콘','퀀텀 안개']),
    ('동물', ['눈밭의 여우','잠든 고양이','비행하는 매','들판의 사슴','강가의 수달','빛나는 반딧불','물속 거북','숲의 부엉이','바다의 돌고래','도심 비둘기',
              '눈 속의 늑대','초원의 사자','북극곰 가족','펭귄 행진','벚꽃 아래 강아지','지붕 위의 까치','풀숲의 토끼','산호초의 물고기','노을의 학','맹수의 눈빛']),
    ('음식', ['김치찌개','베이커리 진열','커피 한 잔','비빔밥','딸기 케이크','라면 한 그릇','회덮밥','브런치 플레이트','스시 모음','와인 한 병',
              '파스타 보울','떡볶이 한판','갈비찜','된장국','샌드위치 트레이','크루아상 진열','마들렌 박스','초콜릿 디저트','홍차와 스콘','막걸리 한잔']),
    ('건축', ['한옥 처마','미니멀 콘크리트','벽돌의 결','돌담길','유리 건물','아치형 입구','계단의 그림자','회색 외벽','돌탑 풍경','낡은 창문',
              '교회의 첨탑','옥상의 정원','대형 돔','육교의 곡선','지하도의 빛','옛 골목 벽','크롬 큐브','노출 콘크리트','피라미드형 외벽','목조 박공']),
    ('야경', ['서울 야경','별이 가득한 밤','강변 야경','도시의 불빛','항구 야경','광장의 밤','거리의 가로등','해안 야경','밤하늘 별자리','마천루 불빛',
              '관람차 야경','다리 위의 빛','새벽 1시','달빛 호수','전망대의 밤','폭죽 야경','북극광','등대 야경','드라이브의 밤','네온 사인']),
    ('일상', ['카페의 오후','책상 위 노트북','읽다 만 책','오후의 햇살','주방의 풍경','식탁 위 꽃','창가 화분','아침 산책','한낮의 휴식','저녁 시간',
              '욕실의 향초','베란다의 빨래','거실의 음악','책장 정리','커튼 사이 햇살','일요일 아침','퇴근길','반려묘와의 저녁','샤워 후','한밤의 라면']),
    ('패션', ['겨울 코트','여름 원피스','봄 자켓','가을 카디건','데님 스타일','미니멀 룩','클래식 정장','스니커즈','액세서리','비니와 머플러',
              '레더 자켓','니트 베스트','롱코트','셔츠와 슬랙스','오버사이즈','빈티지 룩','스트리트 룩','웨딩 드레스','컬러 블록','모노톤 코디']),
    ('스포츠', ['결승선의 환호','새벽 러닝','서핑 보드','농구 경기','축구장 풍경','요가 자세','클라이밍','자전거 라이딩','수영장의 빛','권투 글러브',
                '스케이트 보드','테니스 코트','골프 스윙','마라톤 출발','배드민턴 셔틀','스노보드','승마','다이빙','크로스핏','피겨 스케이트']),
    ('디자인', ['포스터 모음','브랜드 로고','책 표지','패키지','인포그래픽','타이포','아이콘 세트','UI 컴포넌트','명함 디자인','굿즈 시리즈',
                '월페이퍼','앱 화면','웹 배너','쇼핑백','사인 보드','맵 디자인','캘린더','노트 표지','스티커','패턴 시안']),
    ('일러스트', ['수채화 풍경','드로잉 컬렉션','캐릭터 시리즈','판타지 세계','여백의 미','동화 일러스트','컬러 스케치','디지털 페인팅','잉크 작품','연필 드로잉',
                  '귀여운 동물 시리즈','음식 일러스트','계절 일러스트','SF 일러스트','감성 일러스트','캐릭터 디자인','동양화 풍','만화 컷','전통문양','로파이 풍경']),
    ('포트폴리오', ['작업 기록','연도별 선집','시리즈 1','시리즈 2','대표작 모음','클라이언트 워크','개인 작업','실험 시리즈','컨셉북','아카이브',
                    '2024 회고','졸업 작품','공모전 출품','상업 워크','협업 시리즈','자체 프로젝트','스튜디오 셀렉트','대표 시리즈','베스트 10','신작 모음']),
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

GALLERY_TITLES_POOL = [
    '나의 도시 일기','계절의 기록','감성 카탈로그','일상 아카이브','색감 컬렉션',
    '여행의 단상','별빛 모음집','사적인 풍경','조용한 시간','오후의 빛',
    '필름 큐레이션','감성 스튜디오','짧은 메모','반복되는 풍경','지난 봄의 기록',
    '비 내리는 날','한낮의 산책','밤의 거리','색의 정원','순간 포착',
    '느린 호흡','마음의 결','풍경의 단상','사색의 모서리','파편의 미학',
    '오후 다섯시','잔잔한 호수','계절의 페이지','감각의 흐름','빛의 산책',
]

COMMENT_TEMPLATES = [
    '색감이 너무 좋아요',
    '구도가 인상적입니다',
    '분위기 미쳤네요',
    '저장해두고 보고싶은 작품',
    '이 시리즈 계속 보고싶어요',
    '디테일까지 살아있네요',
    '색의 대비가 멋져요',
    '이런 감성 너무 좋습니다',
    '진짜 잘 찍으셨네요',
    '구성 깔끔하니 좋네요',
    '제 취향 저격이에요',
    '톤이 아주 매력적입니다',
    '빛 활용이 인상적이에요',
    '오랜만에 마음에 드는 작품',
    '한 장 한 장 감탄했어요',
    '서사가 느껴져요',
    '바탕 처리가 멋집니다',
    '메인 톤 너무 잘 살렸네요',
    '계속 이런 작업 보여주세요',
    '이번 시리즈 정말 좋아요',
    '작가님의 시선이 좋네요',
    '시간 가는 줄 모르고 봤어요',
    '감성이 잘 살아 있습니다',
    '디자인적으로 잘 짜여진 듯',
    '색 표현이 풍부하네요',
]

CONTEST_TITLES = [
    '도시의 밤 영상 공모전','청춘 단편 영상제','환경 다큐 챌린지','여름 풍경 콘테스트',
    '겨울 감성 영상제','전통문화 영상 공모전','미래도시 비전 콘테스트','광고 크리에이티브 어워드',
    '뮤직비디오 챌린지','단편영상 어워드','브이로그 챌린지','여행 영상 콘테스트',
    '음악 영상 공모전','VR 영상 챌린지','애니메이션 공모전','청년 영화제',
    '서울 영상 공모전','부산 단편 영상제','한국 영상 어워드','로컬 크리에이터 콘테스트',
    '실험영상 챌린지','다큐멘터리 어워드','쇼츠 크리에이티브 어워드','패션 필름 콘테스트',
    'AI 영상 공모전','지속가능성 영상제','우주 비전 콘테스트','일상 단편 영상제',
]
CONTEST_ORGANIZERS = [
    'BIDEO 큐레이션팀','한국영상협회','서울특별시 문화재단','한국콘텐츠진흥원',
    'CJ ENM','KT&G','대한민국 영상콘텐츠진흥원','문화체육관광부',
    '한국영화진흥위원회','국가기록원','부산영상위원회','서울국제영화제 운영위',
    'NHN 클라우드','SK텔레콤','네이버 D2','카카오 임팩트',
]
CONTEST_CATEGORIES = ['단편영상','다큐멘터리','광고/CF','뮤직비디오','애니메이션','VR/360','브이로그','실험영상','쇼츠','패션필름']
CONTEST_PRIZE_TEMPLATES = [
    '총상금 300만원 (대상 100만 / 우수상 50만)',
    '총상금 500만원 (대상 200만 / 우수상 100만)',
    '총상금 1000만원 (대상 500만 / 우수 300만 / 장려 100만)',
    '총상금 200만원',
    '상품권 100만원 (대상 50만 / 우수 30만)',
    '대상 트로피 + 부상 300만원',
    '상금 100만원 + 플랫폼 메인 노출',
    '총상금 700만원 (대상 300만 / 우수 200만 / 장려 100만)',
]

# ------------------------------------------------------------------
# 유틸
# ------------------------------------------------------------------
def gen_nick(used: set) -> str:
    """unique 닉네임 생성."""
    for _ in range(80):
        style = random.random()
        if style < 0.35:
            n = f"{random.choice(HAN_ADJ)}{random.choice(HAN_NOUN)}"
        elif style < 0.55:
            n = f"{random.choice(ENG_PRE)}_{random.choice(ENG_POST)}"
        elif style < 0.80:
            n = f"{random.choice(HAN_ADJ)}{random.choice(HAN_NOUN)}{random.randint(2, 999)}"
        else:
            n = f"{random.choice(ENG_PRE)}{random.randint(11, 99999)}"
        if n not in used:
            used.add(n)
            return n
    n = f"user_{random.randint(100000, 999999)}"
    used.add(n)
    return n


def gen_real_name() -> str:
    return random.choice(SURNAMES) + random.choice(GIVEN_NAMES)


def gen_email(idx: int) -> str:
    return f"member{idx:05d}@bideo.test"


def esc(s: str) -> str:
    return s.replace("'", "''")


def write_batched_inserts(add, header: str, rows, batch_size: int = INSERT_BATCH):
    """rows 를 batch 단위로 잘라 INSERT ... VALUES ... 문 여러 개로 출력."""
    if not rows:
        return
    for i in range(0, len(rows), batch_size):
        chunk = rows[i:i + batch_size]
        add(header)
        add(',\n'.join(chunk) + ';')
        add("")


# ------------------------------------------------------------------
# 본문 생성
# ------------------------------------------------------------------
out_path = os.path.join(os.path.dirname(__file__), 'seed_presentation_v3.sql')
lines = []
add = lines.append

add("-- AI 학습용 대용량 더미 데이터 v3 (자동 생성)")
add("-- 사전 실행: seed_admin_dummy.sql (admin 1 + members 100 + works 100 + auctions 100)")
add("\\encoding UTF8")
add("\\set ON_ERROR_STOP on")
add("BEGIN;")
add("")
add(f"-- 규모: members +{NEW_MEMBERS}, works +{NEW_WORKS}, galleries +{NEW_GALLERIES}, "
    f"auctions +{NEW_AUCTIONS}, follows ~{FOLLOW_ATTEMPTS}, work_likes ~{WORK_LIKE_ATTEMPTS}, "
    f"bookmarks ~{BOOKMARK_ATTEMPTS}, comments {COMMENT_COUNT}, views {WORK_VIEW_COUNT}")
add("")

# --- 1) 회원 ---
add(f"-- 1. 신규 회원 {NEW_MEMBERS:,}명 (id {ADMIN_MEMBERS_MAX_ID + 1}~{TOTAL_MEMBERS})")
used_nicks = set()
member_rows = []
for idx in range(ADMIN_MEMBERS_MAX_ID + 1, TOTAL_MEMBERS + 1):
    nick = gen_nick(used_nicks)
    rname = gen_real_name()
    email = gen_email(idx)
    member_rows.append(
        f"  ('{email}', '$2a$10$dummyhashdummyhashdummyhashdu', '{esc(nick)}', '{esc(rname)}', 'USER', 'ACTIVE')"
    )
write_batched_inserts(
    add,
    "insert into tbl_member (email, password, nickname, real_name, role, status) values",
    member_rows,
)

# 신규 회원에 profile_image / banner_image 부여 (admin 1~101 은 admin_dummy 관리)
add(f"""-- 회원 profile_image: picsum.photos placeholder (member.id seed)
update tbl_member
   set profile_image = 'https://picsum.photos/seed/m' || id::text || '/256/256'
 where id > {ADMIN_MEMBERS_MAX_ID} and (profile_image is null or profile_image = '');""")
add(f"""-- 회원 banner_image: ~33% 회원만 (현실감)
update tbl_member
   set banner_image = 'https://picsum.photos/seed/b' || id::text || '/1280/200'
 where id > {ADMIN_MEMBERS_MAX_ID} and (id % 3 = 0) and (banner_image is null or banner_image = '');""")
add("")

# --- 2) 작품 ---
add(f"-- 2. 작품 {NEW_WORKS:,}개 (id {ADMIN_WORKS_MAX_ID + 1}~{TOTAL_WORKS})")
work_rows = []
for _ in range(NEW_WORKS):
    mid = random.randint(1, TOTAL_MEMBERS)
    cat, titles = random.choice(CATEGORIES)
    title = random.choice(titles) + ' #' + str(random.randint(1, 999))
    desc = f"{cat} 분위기를 담은 {title.split(' #')[0]} 작품. 색감과 디테일에 집중했습니다."
    price = random.choice([0, 0, 0, 0, 5000, 10000, 20000, 30000, 50000, 80000, 100000, 150000, 300000])
    license_type = random.choice(['PERSONAL', 'PERSONAL', 'COMMERCIAL', 'COMMERCIAL', 'EXCLUSIVE'])
    is_tradable = 'true' if price > 0 and random.random() < 0.7 else 'false'
    view = random.randint(20, 10000)
    like = random.randint(0, view // 4)
    save = random.randint(0, like // 2 + 1)
    comment = random.randint(0, 50)
    days_ago = random.randint(0, 540)
    created = (datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))).strftime('%Y-%m-%d %H:%M:%S')
    work_rows.append(
        f"  ({mid}, '{esc(title)}', '{cat}', '{esc(desc)}', {price}, '{license_type}', "
        f"{is_tradable}, true, true, {view}, {like}, {save}, {comment}, 'ACTIVE', '{created}')"
    )
write_batched_inserts(
    add,
    "insert into tbl_work (member_id, title, category, description, price, license_type, "
    "is_tradable, allow_comment, show_similar, view_count, like_count, save_count, "
    "comment_count, status, created_datetime) values",
    work_rows,
)

# 작품 thumbnail (admin 페이지 등에서 직접 컬럼 사용) + work_file (메인/프로필 lateral join 용)
add(f"""-- 작품 thumbnail: picsum.photos placeholder (work.id seed)
update tbl_work
   set thumbnail = 'https://picsum.photos/seed/w' || id::text || '/640/360'
 where id > {ADMIN_WORKS_MAX_ID} and (thumbnail is null or thumbnail = '');""")
add(f"""-- tbl_work_file: 메인/프로필 매퍼가 lateral join 으로 가져가는 썸네일 row
insert into tbl_work_file (work_id, file_url, file_type, file_size, width, height, sort_order)
select w.id,
       'https://picsum.photos/seed/w' || w.id::text || '/640/360',
       'image/jpeg',
       102400,
       640, 360, 0
  from tbl_work w
 where w.id > {ADMIN_WORKS_MAX_ID}
   and w.deleted_datetime is null
   and not exists (select 1 from tbl_work_file f where f.work_id = w.id);""")
add("")

# --- 3) 갤러리 (cover_image 는 INSERT 후 UPDATE 로 gallery.id 기반 통일) ---
add(f"-- 3. 갤러리 {NEW_GALLERIES:,}개")
gal_rows = []
for _ in range(NEW_GALLERIES):
    mid = random.randint(1, TOTAL_MEMBERS)
    title = random.choice(GALLERY_TITLES_POOL) + ' vol.' + str(random.randint(1, 24))
    desc = "작가 본인이 큐레이션한 시리즈. 일상의 시선이 담겨 있다."
    work_count = random.randint(3, 25)
    view = random.randint(50, 12000)
    like = random.randint(0, view // 4)
    comment = random.randint(0, 40)
    days_ago = random.randint(0, 540)
    created = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
    gal_rows.append(
        f"  ({mid}, '{esc(title)}', '{esc(desc)}', {work_count}, {view}, {like}, {comment}, 'EXHIBITING', '{created}')"
    )
write_batched_inserts(
    add,
    "insert into tbl_gallery (member_id, title, description, work_count, view_count, "
    "like_count, comment_count, status, created_datetime) values",
    gal_rows,
)

# cover_image 를 gallery.id 기반 picsum.photos URL 로 통일
add("""-- 갤러리 cover_image: picsum.photos placeholder (gallery.id seed)
update tbl_gallery
   set cover_image = 'https://picsum.photos/seed/g' || id::text || '/640/400'
 where cover_image is null or cover_image = '';""")
add("")

# --- 3-1) 갤러리 ↔ 작품 매핑 (각 갤러리당 work_count 만큼) ---
add("-- 3-1. 갤러리-작품 매핑 (work_count 기준, 동일 작가 작품 우선)")
add(f"""drop table if exists _gw_cand;
create temp table _gw_cand as
select g.id as gallery_id,
       g.member_id as gallery_owner,
       g.work_count
  from tbl_gallery g
 where g.deleted_datetime is null
   and not exists (select 1 from tbl_gallery_work gw where gw.gallery_id = g.id);

-- 각 갤러리에 (work_count) 만큼 작품 ROW 부여 (작가 본인 작품을 우선 60%, 나머지 랜덤 40%)
insert into tbl_gallery_work (gallery_id, work_id, sort_order)
select gallery_id, work_id, sort_order
  from (
    select c.gallery_id,
           w.id as work_id,
           row_number() over (partition by c.gallery_id order by random()) - 1 as sort_order,
           c.work_count
      from _gw_cand c
      join lateral (
        -- 작가 본인 작품 풀에서 우선, 부족하면 전체 작품에서
        (select w.id from tbl_work w
          where w.deleted_datetime is null and w.status='ACTIVE'
            and w.member_id = c.gallery_owner
          order by random() limit greatest(c.work_count, 1))
        union
        (select w.id from tbl_work w
          where w.deleted_datetime is null and w.status='ACTIVE'
            and w.id > {ADMIN_WORKS_MAX_ID}
          order by random() limit c.work_count)
      ) w on true
  ) ranked
 where sort_order < work_count
on conflict (gallery_id, work_id) do nothing;

drop table _gw_cand;""")
add("")

# 매핑 결과로 work_count 재동기화
add("""update tbl_gallery g
   set work_count = coalesce(c.cnt, 0)
  from (select gallery_id, count(*) cnt from tbl_gallery_work group by gallery_id) c
 where g.id = c.gallery_id;""")
add("")

# --- 3-2) 공모전 (다양한 상태 분포) ---
add(f"-- 3-2. 공모전 {NEW_CONTESTS}건 (UPCOMING/OPEN/CLOSED/RESULT 분포)")
today = datetime.now().date()
cont_rows = []
for i in range(NEW_CONTESTS):
    title = random.choice(CONTEST_TITLES) + ' #' + str(i + 1)
    organizer = random.choice(CONTEST_ORGANIZERS)
    category = random.choice(CONTEST_CATEGORIES)
    prize = random.choice(CONTEST_PRIZE_TEMPLATES)
    state = random.choices(
        ['UPCOMING', 'OPEN', 'CLOSED', 'RESULT'],
        weights=[20, 30, 25, 25],
    )[0]
    if state == 'UPCOMING':
        entry_start = today + timedelta(days=random.randint(5, 60))
        entry_end = entry_start + timedelta(days=random.randint(14, 30))
        result_date = entry_end + timedelta(days=random.randint(7, 21))
    elif state == 'OPEN':
        entry_start = today - timedelta(days=random.randint(1, 20))
        entry_end = today + timedelta(days=random.randint(5, 30))
        result_date = entry_end + timedelta(days=random.randint(7, 21))
    elif state == 'CLOSED':
        entry_start = today - timedelta(days=random.randint(45, 90))
        entry_end = today - timedelta(days=random.randint(1, 30))
        result_date = entry_end + timedelta(days=random.randint(7, 30))
    else:  # RESULT
        entry_start = today - timedelta(days=random.randint(120, 200))
        entry_end = today - timedelta(days=random.randint(30, 90))
        result_date = today - timedelta(days=random.randint(1, 28))
    mid = random.randint(1, TOTAL_MEMBERS)
    desc = f"{category} 분야 영상을 공모하는 {title} 행사. {organizer}이(가) 주최하며 다양한 창작자의 참여를 기다립니다."
    entry_fee = random.choice([0, 0, 0, 0, 5000, 10000, 30000])
    view = random.randint(100, 10_000)
    cont_rows.append(
        f"  ({mid}, '{esc(title)}', '{esc(organizer)}', '{esc(category)}', '{esc(desc)}', "
        f"'{entry_start}', '{entry_end}', '{result_date}', '{esc(prize)}', "
        f"{entry_fee}, '{state}', {view})"
    )
write_batched_inserts(
    add,
    "insert into tbl_contest (member_id, title, organizer, category, description, "
    "entry_start, entry_end, result_date, prize_info, price, status, view_count) values",
    cont_rows,
)

# cover_image 통일 (contest.id 기반)
add("""-- 공모전 cover_image: picsum.photos placeholder (contest.id seed)
update tbl_contest
   set cover_image = 'https://picsum.photos/seed/c' || id::text || '/800/400'
 where cover_image is null or cover_image = '';""")
add("")

# 공모전 태그 매핑 (각 공모전당 3~5개)
add("""-- 공모전 태그 매핑 (각 공모전당 3~5개 랜덤 태그)
insert into tbl_contest_tag (contest_id, tag_id)
select c.id, t.id
  from tbl_contest c
  cross join lateral (
    select tag.id from tbl_tag tag
     order by random()
     limit 3 + (random() * 3)::int
  ) t
on conflict (contest_id, tag_id) do nothing;""")
add("")

# 공모전 출품 매핑 (각 공모전당 5~30개, CLOSED/RESULT 는 상위 3명 수상)
add(f"""-- 공모전 출품 매핑 (각 공모전당 5~30개, 종료 공모전은 상위 3명 수상)
insert into tbl_contest_entry (contest_id, work_id, member_id, award_rank, submitted_at)
select c.id, w.work_id, w.member_id,
       case when c.status in ('CLOSED','RESULT') and w.rn = 1 then '대상'
            when c.status in ('CLOSED','RESULT') and w.rn = 2 then '우수상'
            when c.status in ('CLOSED','RESULT') and w.rn = 3 then '장려상'
            else null end,
       c.entry_start + ((random() * greatest((c.entry_end - c.entry_start), 1))::int) * interval '1 day'
  from tbl_contest c
  cross join lateral (
    select id as work_id, member_id, row_number() over () as rn
      from (select id, member_id from tbl_work
             where deleted_datetime is null and status='ACTIVE'
               and id > {ADMIN_WORKS_MAX_ID}
             order by random()
             limit 5 + (random() * 25)::int) src
  ) w
on conflict (contest_id, work_id) do nothing;""")
add("")

# entry_count 동기화
add("""update tbl_contest c
   set entry_count = coalesce(e.cnt, 0)
  from (select contest_id, count(*) cnt from tbl_contest_entry group by contest_id) e
 where c.id = e.contest_id;""")
add("")

# 인게이지먼트 분포: power-law(α=2) bias로 일부 인기 작품/유저가 다수의 view/like/follower 를 흡수.
# 이 변동성이 view_count/save_count/follower_count 의 분산을 만들어 학습 가능한 시그널이 됨.
# work_id 선택식: 1 + (power(random(), 2) * (TOTAL_WORKS-1))::int

# --- 4) 팔로우 (popularity bias) ---
add(f"-- 4. 팔로우 시도 {FOLLOW_ATTEMPTS:,}회 (following_id 는 power-law bias)")
add(f"""insert into tbl_follow (follower_id, following_id, created_datetime)
select f, fl, now() - (random() * interval '365 days')
  from (
    select 1 + (random() * {TOTAL_MEMBERS - 1})::int as f,
           1 + (power(random(), 2.0) * {TOTAL_MEMBERS - 1})::int as fl
      from generate_series(1, {FOLLOW_ATTEMPTS})
  ) raw
 where f <> fl
on conflict (follower_id, following_id) do nothing;""")
add("")

# --- 5) 작품 조회 로그 (popularity bias) ---
add(f"-- 5. 작품 조회 로그 {WORK_VIEW_COUNT:,}건 (work_id power-law bias)")
add(f"""insert into tbl_work_view (work_id, member_id, viewed_at, created_datetime)
select w, m, ts, ts
  from (
    select 1 + (power(random(), 2.0) * {TOTAL_WORKS - 1})::int as w,
           1 + (random() * {TOTAL_MEMBERS - 1})::int as m,
           now() - (random() * interval '540 days') as ts
      from generate_series(1, {WORK_VIEW_COUNT})
  ) raw;""")
add("")

# --- 6) 작품 좋아요 (popularity bias) ---
add(f"-- 6. 작품 좋아요 시도 {WORK_LIKE_ATTEMPTS:,}회 (work_id power-law bias)")
add(f"""insert into tbl_work_like (work_id, member_id, created_datetime)
select w, m, now() - (random() * interval '540 days')
  from (
    select 1 + (power(random(), 2.0) * {TOTAL_WORKS - 1})::int as w,
           1 + (random() * {TOTAL_MEMBERS - 1})::int as m
      from generate_series(1, {WORK_LIKE_ATTEMPTS})
  ) raw
on conflict (work_id, member_id) do nothing;""")
add("")

# --- 7) 갤러리 좋아요 ---
add(f"-- 7. 갤러리 좋아요 시도 {GALLERY_LIKE_ATTEMPTS:,}회")
add(f"""insert into tbl_gallery_like (gallery_id, member_id, created_datetime)
select g, m, now() - (random() * interval '540 days')
  from (
    select 1 + (random() * {NEW_GALLERIES - 1})::int as g,
           1 + (random() * {TOTAL_MEMBERS - 1})::int as m
      from generate_series(1, {GALLERY_LIKE_ATTEMPTS})
  ) raw
on conflict (gallery_id, member_id) do nothing;""")
add("")

# --- 8) 북마크 (WORK 위주, work 는 power-law bias) ---
add(f"-- 8. 북마크 시도 {BOOKMARK_ATTEMPTS:,}회 (WORK 80% power-law, GALLERY 20%)")
add(f"""insert into tbl_bookmark (member_id, target_type, target_id, created_datetime)
select m, tgt, tid, now() - (random() * interval '540 days')
  from (
    select 1 + (random() * {TOTAL_MEMBERS - 1})::int as m,
           case when random() < 0.8 then 'WORK' else 'GALLERY' end as tgt,
           1 + (power(random(), 2.0) * {TOTAL_WORKS - 1})::int as w_tid,
           1 + (random() * {NEW_GALLERIES - 1})::int as g_tid
      from generate_series(1, {BOOKMARK_ATTEMPTS})
  ) raw
  cross join lateral (select case when tgt = 'WORK' then w_tid else g_tid end as tid) t
on conflict (member_id, target_type, target_id) do nothing;""")
add("")

# --- 9) 댓글 ---
add(f"-- 9. 댓글 {COMMENT_COUNT:,}건 (WORK 75% / GALLERY 25%)")
templates_sql = "array[" + ",".join(f"'{esc(t)}'" for t in COMMENT_TEMPLATES) + "]::varchar[]"
add(f"""insert into tbl_comment (member_id, target_type, target_id, content, created_datetime)
select 1 + (random() * {TOTAL_MEMBERS - 1})::int,
       case when r < 0.75 then 'WORK' else 'GALLERY' end,
       case when r < 0.75
            then 1 + (power(random(), 2.0) * {TOTAL_WORKS - 1})::int
            else 1 + (random() * {NEW_GALLERIES - 1})::int end,
       ({templates_sql})[1 + (random() * {len(COMMENT_TEMPLATES) - 1})::int],
       now() - (random() * interval '540 days')
  from (
    select random() as r
      from generate_series(1, {COMMENT_COUNT})
  ) raw;""")
add("")

# --- 10) 인게이지먼트 디놀멀라이즈 (경매 status 결정에 사용할 값) ---
add("-- 10. 인게이지먼트 카운트 동기화 (경매 생성 전 선반영)")
add("""update tbl_work w
   set view_count = coalesce(c.cnt, 0)
  from (select work_id, count(*) cnt from tbl_work_view group by work_id) c
 where w.id = c.work_id;""")
add("""update tbl_work w
   set view_count = 0
 where w.id not in (select work_id from tbl_work_view);""")
add("""update tbl_work w
   set save_count = coalesce(c.cnt, 0)
  from (select target_id, count(*) cnt from tbl_bookmark where target_type='WORK' group by target_id) c
 where w.id = c.target_id;""")
add("""update tbl_work w
   set save_count = 0
 where w.id not in (select target_id from tbl_bookmark where target_type='WORK');""")
add("""update tbl_work w
   set like_count = coalesce(c.cnt, 0)
  from (select work_id, count(*) cnt from tbl_work_like group by work_id) c
 where w.id = c.work_id;""")
add("""update tbl_member m
   set follower_count = coalesce(c.cnt, 0)
  from (select following_id, count(*) cnt from tbl_follow group by following_id) c
 where m.id = c.following_id;""")
add("""update tbl_member m
   set follower_count = 0
 where m.id not in (select following_id from tbl_follow);""")
add("")

# --- 11) 경매 (2단계 임시 테이블로 random 값 freeze 후 INSERT) ---
# 1단계: 샘플링 (order by random() 의 random 호출이 select random() 과 묶이지 않도록 분리)
# 2단계: 분리된 select 에서 random 값 컬럼 부여 → INSERT 시 freeze 됨
add(f"-- 11. 경매 {NEW_AUCTIONS:,}건 (status: ACTIVE 35% / SOLD~EXPIRED 65%, quality 기반 SOLD 비율)")
add("drop table if exists _auction_sample;")
add(f"""create temp table _auction_sample as
select w.id as work_id,
       w.member_id as seller_id,
       greatest(coalesce(w.price, 0), 10000) as sp,
       coalesce(w.view_count, 0) as v_cnt,
       coalesce(w.save_count, 0) as s_cnt
  from tbl_work w
 where w.deleted_datetime is null and w.status = 'ACTIVE'
   and w.id > {ADMIN_WORKS_MAX_ID}
   and w.id not in (select work_id from tbl_auction where work_id is not null)
 order by random()
 limit {NEW_AUCTIONS};""")

add("drop table if exists _auction_cand;")
add("""create temp table _auction_cand as
select s.work_id, s.seller_id, s.sp, s.v_cnt, s.s_cnt,
       coalesce(m.follower_count, 0) as f_cnt,
       random() as r_state,
       random() as r_outcome,
       random() as r_hours,
       random() as r_started,
       random() as r_bidcnt,
       random() as r_winner,
       random() as r_closing
  from _auction_sample s
  left join tbl_member m on m.id = s.seller_id;""")
add("drop table _auction_sample;")

add("""alter table _auction_cand add column quality_raw double precision;
update _auction_cand
   set quality_raw = ln(v_cnt + 1) + 1.5 * ln(s_cnt + 1) + 2.0 * ln(f_cnt + 1);""")

add("""alter table _auction_cand add column final_status varchar(20);
update _auction_cand
   set final_status = case
     when r_state < 0.35 then 'ACTIVE'
     when r_outcome < (0.15 + 0.70 * least(1.0, quality_raw / 18.0)) then 'SOLD'
     else 'EXPIRED'
   end;""")

add(f"""insert into tbl_auction (work_id, seller_id, asking_price, starting_price, bid_increment,
                         current_price, bid_count, fee_rate, fee_amount, settlement_amount,
                         deadline_hours, started_at, closing_at, status, winner_id, final_price)
select work_id, seller_id,
       sp * 2, sp,
       greatest(sp / 10, 1000),
       case
         when final_status = 'SOLD' then sp + (r_bidcnt * sp * 3)::int
         when final_status = 'ACTIVE' then sp + (r_bidcnt * sp)::int
         else sp
       end as current_price,
       case
         when final_status = 'SOLD' then 5 + (r_bidcnt * 25)::int
         when final_status = 'ACTIVE' then (r_bidcnt * 10)::int
         else 0
       end as bid_count,
       0.10, 0, 0,
       (24 + (r_hours * 240)::int) as deadline_hours,
       now() - (r_started * interval '180 days'),
       case
         when final_status in ('SOLD', 'EXPIRED') then now() - (r_closing * interval '40 days')
         else now() + ((24 + (r_hours * 240)::int)::text || ' hours')::interval
       end as closing_at,
       final_status,
       case
         when final_status = 'SOLD' then 1 + (r_winner * {TOTAL_MEMBERS - 1})::int
         else null
       end as winner_id,
       case
         when final_status = 'SOLD' then sp + (r_bidcnt * sp * 3)::int
         else null
       end as final_price
  from _auction_cand;""")

add("drop table _auction_cand;")
add("")

# --- 12) 입찰 (SOLD/ACTIVE 경매에 대해 cross join, EXPIRED 는 0건) ---
add(f"-- 12. 입찰 (SOLD/ACTIVE 경매만, 경매당 {BIDS_PER_AUCTION_MIN}~{BIDS_PER_AUCTION_MAX}건)")
add(f"""insert into tbl_bid (auction_id, member_id, bid_price, is_winning, created_datetime)
select a.id,
       1 + (random() * {TOTAL_MEMBERS - 1})::int,
       a.starting_price + ((random() * a.starting_price * 3)::int),
       false,
       a.started_at + (random() * (least(now(), a.closing_at) - a.started_at))
  from tbl_auction a
  cross join generate_series(1, {BIDS_PER_AUCTION_MIN} + (random() * {BIDS_PER_AUCTION_MAX - BIDS_PER_AUCTION_MIN})::int)
  where a.status in ('SOLD', 'ACTIVE')
    and a.id > {ADMIN_AUCTIONS_MAX_ID};""")
add("")

# --- 13) is_winning 갱신 + SOLD 경매의 winner/price 를 실제 최고가 입찰자로 정렬 ---
add("-- 13. SOLD 경매 winner/price 동기화")
add(f"""update tbl_bid b
   set is_winning = true
  from (
    select distinct on (auction_id) id, auction_id
      from tbl_bid
     where auction_id > {ADMIN_AUCTIONS_MAX_ID}
     order by auction_id, bid_price desc, id desc
  ) top
 where b.id = top.id;""")
add(f"""update tbl_auction a
   set winner_id = top.member_id,
       final_price = top.bid_price,
       current_price = top.bid_price
  from (
    select distinct on (auction_id) auction_id, member_id, bid_price
      from tbl_bid
     where auction_id > {ADMIN_AUCTIONS_MAX_ID}
     order by auction_id, bid_price desc, id desc
  ) top
 where a.id = top.auction_id
   and a.status = 'SOLD';""")
add("")

# --- 14) 나머지 비정규화 카운트 동기화 ---
add("-- 14. 잔여 비정규화 카운트 sync")
add("""update tbl_member m
   set follower_count = coalesce(c.cnt, 0)
  from (select following_id, count(*) cnt from tbl_follow group by following_id) c
 where m.id = c.following_id;""")
add("""update tbl_member m
   set follower_count = 0
 where m.id not in (select following_id from tbl_follow);""")
add("""update tbl_member m
   set following_count = coalesce(c.cnt, 0)
  from (select follower_id, count(*) cnt from tbl_follow group by follower_id) c
 where m.id = c.follower_id;""")
add("""update tbl_member m
   set following_count = 0
 where m.id not in (select follower_id from tbl_follow);""")
add("""update tbl_member m
   set gallery_count = coalesce(c.cnt, 0)
  from (select member_id, count(*) cnt from tbl_gallery where deleted_datetime is null group by member_id) c
 where m.id = c.member_id;""")
add("""update tbl_work w
   set like_count = coalesce(c.cnt, 0)
  from (select work_id, count(*) cnt from tbl_work_like group by work_id) c
 where w.id = c.work_id;""")
add("""update tbl_work w
   set save_count = coalesce(c.cnt, 0)
  from (select target_id, count(*) cnt from tbl_bookmark where target_type='WORK' group by target_id) c
 where w.id = c.target_id;""")
add("""update tbl_work w
   set comment_count = coalesce(c.cnt, 0)
  from (select target_id, count(*) cnt from tbl_comment
         where target_type='WORK' and parent_id is null and deleted_datetime is null group by target_id) c
 where w.id = c.target_id;""")
# 댓글이 없는 작품은 0 으로 (INSERT 시 random 값이 남아있는 케이스 차단)
add("""update tbl_work w
   set comment_count = 0
 where w.comment_count > 0
   and not exists (select 1 from tbl_comment c
     where c.target_type='WORK' and c.target_id=w.id
       and c.parent_id is null and c.deleted_datetime is null);""")
add("""update tbl_work w
   set view_count = coalesce(c.cnt, 0)
  from (select work_id, count(*) cnt from tbl_work_view group by work_id) c
 where w.id = c.work_id;""")
add("""update tbl_gallery g
   set like_count = coalesce(c.cnt, 0)
  from (select gallery_id, count(*) cnt from tbl_gallery_like group by gallery_id) c
 where g.id = c.gallery_id;""")
add("""update tbl_gallery g
   set comment_count = coalesce(c.cnt, 0)
  from (select target_id, count(*) cnt from tbl_comment
         where target_type='GALLERY' and parent_id is null and deleted_datetime is null group by target_id) c
 where g.id = c.target_id;""")
# 댓글이 없는 갤러리는 0 으로 (INSERT 시 random 값 차단)
add("""update tbl_gallery g
   set comment_count = 0
 where g.comment_count > 0
   and not exists (select 1 from tbl_comment c
     where c.target_type='GALLERY' and c.target_id=g.id
       and c.parent_id is null and c.deleted_datetime is null);""")
add("""update tbl_auction a
   set bid_count = coalesce(b.cnt, 0),
       current_price = coalesce(b.max_price, a.starting_price)
  from (select auction_id, count(*) cnt, max(bid_price) max_price from tbl_bid group by auction_id) b
 where a.id = b.auction_id;""")
add("")

add("COMMIT;")
add("")
add("-- 최종 row 수 확인")
add("\\echo")
add("\\echo '=> Final row counts:'")
add("""select 'members'         t, count(*) from tbl_member
 union all select 'works',            count(*) from tbl_work
 union all select 'galleries',        count(*) from tbl_gallery
 union all select 'auctions',         count(*) from tbl_auction
 union all select 'bids',             count(*) from tbl_bid
 union all select 'follows',          count(*) from tbl_follow
 union all select 'work_likes',       count(*) from tbl_work_like
 union all select 'gallery_likes',    count(*) from tbl_gallery_like
 union all select 'bookmarks',        count(*) from tbl_bookmark
 union all select 'comments',         count(*) from tbl_comment
 union all select 'work_views',       count(*) from tbl_work_view
 union all select 'contests',         count(*) from tbl_contest
 union all select 'contest_tags',     count(*) from tbl_contest_tag
 union all select 'contest_entries',  count(*) from tbl_contest_entry;""")

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'생성 완료: {out_path}')
print(f'  파일 크기: {os.path.getsize(out_path) / 1024 / 1024:.2f} MB')
print(f'  라인 수  : {len(lines):,}')
print(f'  회원 +{NEW_MEMBERS:,} / 작품 +{NEW_WORKS:,} / 갤러리 +{NEW_GALLERIES:,} / 경매 +{NEW_AUCTIONS:,}')
print(f'  follows ~{FOLLOW_ATTEMPTS:,} / work_likes ~{WORK_LIKE_ATTEMPTS:,} / '
      f'bookmarks ~{BOOKMARK_ATTEMPTS:,} / comments {COMMENT_COUNT:,} / views {WORK_VIEW_COUNT:,}')
