"""
Unsplash 이미지를 카테고리별로 받아 S3에 업로드하고
tbl_work.thumbnail / tbl_gallery.cover_image를 업데이트.

선행:
  pip install requests boto3 psycopg2-binary
  setx UNSPLASH_ACCESS_KEY "your_access_key"
  AWS 자격증명 (~/.aws/credentials or env)

실행:
  python seed_images_unsplash.py
"""
import os
import io
import time
import uuid
import random
import requests
import psycopg2
import boto3

UNSPLASH_KEY = os.getenv('UNSPLASH_ACCESS_KEY')
if not UNSPLASH_KEY:
    raise SystemExit('환경변수 UNSPLASH_ACCESS_KEY 가 필요합니다.')

S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'gb-ljs')
S3_REGION = os.getenv('AWS_REGION', 'ap-northeast-2')

DB_DSN = dict(host='localhost', port=5432, dbname='bideo', user='bideo', password='1234')

CATEGORY_QUERY = {
    '도시': 'urban city street korea',
    '자연': 'nature landscape forest',
    '인물': 'portrait person studio',
    '추상': 'abstract art texture',
    'SF': 'cyberpunk neon futuristic',
    '동물': 'wild animal closeup',
    '음식': 'food photography flatlay',
    '건축': 'architecture building modern',
    '야경': 'night cityscape lights',
    '일상': 'cozy daily life',
    '패션': 'fashion outfit street',
    '스포츠': 'sport action running',
    '디자인': 'graphic design poster',
    '일러스트': 'illustration drawing',
    '포트폴리오': 'creative workspace desk',
    '미분류': 'creative artwork',
}

s3 = boto3.client('s3', region_name=S3_REGION)
session = requests.Session()
session.headers.update({'Authorization': f'Client-ID {UNSPLASH_KEY}'})


def search_pool(query: str, count: int = 30) -> list[str]:
    """Unsplash 검색 → urls.regular 리스트 (CDN URL)."""
    try:
        r = session.get(
            'https://api.unsplash.com/search/photos',
            params={'query': query, 'per_page': min(count, 30), 'orientation': 'landscape'},
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        return [p['urls']['regular'] for p in data.get('results', [])]
    except Exception as e:
        print(f'  [search 실패] {query}: {e}')
        return []


def download(url: str) -> bytes | None:
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        return r.content
    except Exception as e:
        print(f'  [download 실패] {url[:60]}: {e}')
        return None


def upload_to_s3(blob: bytes, prefix: str) -> str:
    key = f'{prefix}/{uuid.uuid4()}.jpg'
    s3.put_object(Bucket=S3_BUCKET, Key=key, Body=blob, ContentType='image/jpeg')
    return key


def main():
    conn = psycopg2.connect(**DB_DSN)
    conn.autocommit = False
    cur = conn.cursor()

    # 카테고리별 풀 미리 받기 (API 콜 16회 정도)
    print('[1/3] Unsplash 카테고리별 풀 수집 중...')
    pool: dict[str, list[str]] = {}
    for cat, query in CATEGORY_QUERY.items():
        urls = search_pool(query, 30)
        pool[cat] = urls
        print(f'  {cat:10s}: {len(urls)}장')
        time.sleep(0.1)

    if not any(pool.values()):
        raise SystemExit('Unsplash 검색 결과가 비어있습니다. API 키 확인 필요.')

    # 폴백 풀 (특정 카테고리가 비어 있을 때 사용)
    fallback = []
    for v in pool.values():
        fallback.extend(v)

    def pick_url(cat: str) -> str | None:
        urls = pool.get(cat) or fallback
        return random.choice(urls) if urls else None

    # 2) 작품 thumbnail 일괄 갱신
    print('\n[2/3] tbl_work.thumbnail 갱신 중...')
    cur.execute(
        "select id, coalesce(category, '미분류') from tbl_work "
        "where deleted_datetime is null and status <> 'DELETED' order by id"
    )
    works = cur.fetchall()
    work_total = len(works)
    print(f'  대상 작품 {work_total}건')

    for i, (wid, cat) in enumerate(works, 1):
        url = pick_url(cat)
        if not url:
            continue
        blob = download(url)
        if not blob:
            continue
        key = upload_to_s3(blob, 'works')
        cur.execute('update tbl_work set thumbnail=%s where id=%s', (key, wid))
        # 같은 작품의 첫 work_file도 동일 키로 정렬 (없으면 insert)
        cur.execute(
            'select id from tbl_work_file where work_id=%s order by sort_order, id limit 1',
            (wid,),
        )
        row = cur.fetchone()
        if row:
            cur.execute('update tbl_work_file set file_url=%s where id=%s', (key, row[0]))
        else:
            cur.execute(
                "insert into tbl_work_file (work_id, file_url, file_type, file_size, sort_order) "
                "values (%s, %s, 'image/jpeg', %s, 0)",
                (wid, key, len(blob)),
            )
        if i % 20 == 0:
            conn.commit()
            print(f'  {i}/{work_total} ({i * 100 // work_total}%) 처리 — commit')

    conn.commit()

    # 3) 갤러리 cover 일괄 갱신
    print('\n[3/3] tbl_gallery.cover_image 갱신 중...')
    cur.execute(
        "select g.id from tbl_gallery g "
        "where g.deleted_datetime is null and g.status <> 'DELETED' order by g.id"
    )
    galleries = [row[0] for row in cur.fetchall()]
    print(f'  대상 갤러리 {len(galleries)}건')

    for i, gid in enumerate(galleries, 1):
        # 갤러리에 매핑된 첫 작품의 카테고리 사용
        cur.execute(
            'select coalesce(w.category, %s) from tbl_gallery_work gw '
            'join tbl_work w on w.id = gw.work_id '
            'where gw.gallery_id = %s order by gw.sort_order, gw.id limit 1',
            ('미분류', gid),
        )
        row = cur.fetchone()
        cat = row[0] if row else '미분류'
        url = pick_url(cat)
        if not url:
            continue
        blob = download(url)
        if not blob:
            continue
        key = upload_to_s3(blob, 'galleries')
        cur.execute('update tbl_gallery set cover_image=%s where id=%s', (key, gid))
        if i % 10 == 0:
            conn.commit()
            print(f'  {i}/{len(galleries)} ({i * 100 // len(galleries)}%)')

    conn.commit()

    # 콘테스트 cover_image도 카테고리별 재매핑
    print('\n[bonus] tbl_contest.cover_image 갱신 중...')
    cur.execute(
        "select id, coalesce(category, '미분류') from tbl_contest "
        "where deleted_datetime is null and status <> 'DELETED' order by id"
    )
    contests = cur.fetchall()
    for cid, cat in contests:
        # 콘테스트 카테고리는 영상/사진 등 다양 — 매핑되는 풀 없으면 fallback
        url = pick_url(cat) or pick_url('미분류')
        if not url:
            continue
        blob = download(url)
        if not blob:
            continue
        key = upload_to_s3(blob, 'contests')
        cur.execute('update tbl_contest set cover_image=%s where id=%s', (key, cid))
    conn.commit()
    print(f'  콘테스트 {len(contests)}건 완료')

    cur.close()
    conn.close()
    print('\n전체 완료')


if __name__ == '__main__':
    main()
