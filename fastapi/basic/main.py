from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import db
from fastapi import FastAPI
from router import product, ai, work, gallery, auction_rag


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 실행
    await db.connect() # 여기서 self._pool이 생성되어야 합니다!
    yield
    # 서버 종료 시 실행
    await db.disconnect()


app = FastAPI(lifespan=lifespan)

# 기존 상품/AI 라우터
app.include_router(product.router)
app.include_router(ai.router)

# 회귀 예측 라우터 등록
app.include_router(work.router)
app.include_router(gallery.router)
app.include_router(auction_rag.router)

origins = [
    "http://127.0.0.1:3001",
    "https://localhost:10000",
    "http://localhost:10000",
    "https://bideo.shop",
    "http://bideo.shop",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "database": "configured" if db.url else "missing",
    }


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
