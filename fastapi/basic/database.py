import asyncpg
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# .env 파일을 읽어서 환경 변수로 등록
load_dotenv()

class Database:
    def __init__(self):
        self._pool = None
        self.url = os.getenv("DATABASE_URL") or self._build_url_from_env()

    def _build_url_from_env(self):
        host = os.getenv("EC2_HOST") or os.getenv("PSQL_HOST") or os.getenv("POSTGRES_HOST")
        port = os.getenv("PSQL_PORT") or os.getenv("POSTGRES_PORT") or "5432"
        database = os.getenv("PSQL_DATABASE") or os.getenv("POSTGRES_DB")
        username = os.getenv("PSQL_USERNAME") or os.getenv("POSTGRES_USER")
        password = os.getenv("PSQL_PASSWORD") or os.getenv("POSTGRES_PASSWORD")
        if not all([host, database, username, password]):
            return None
        return f"postgresql://{username}:{password}@{host}:{port}/{database}"

    async def connect(self):
        if not self._pool:
            if not self.url:
                raise RuntimeError("DATABASE_URL 또는 PSQL_* DB 환경변수가 필요합니다.")
            self._pool = await asyncpg.create_pool(self.url)

    async def disconnect(self):
        if self._pool:
            await self._pool.close()

    @asynccontextmanager
    async def get_connection(self):
        # pool.acquire()는 비동기 컨텍스트 매니저를 반환함
        async with self._pool.acquire() as connection:
            yield connection

db = Database()
