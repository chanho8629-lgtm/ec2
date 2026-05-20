# BIDEO Internal FastAPI

FastAPI는 bideo 이미지 안에 포함되어 같은 `bideo` 컨테이너에서 실행된다.
Spring은 컨테이너 내부 주소인 `http://127.0.0.1:8000`으로 FastAPI를 호출한다.

## Deploy

GitHub Actions가 bideo 이미지를 빌드할 때 이 폴더를 `/app/fastapi/basic`에 복사하고,
`scripts/docker/start-bideo.sh`가 Uvicorn과 Spring Boot를 같이 시작한다.

서버 확인:

```bash
docker ps
docker exec bideo sh -c 'echo "$FASTAPI_BASE_URL"'
docker exec bideo sh -c 'curl -v "$FASTAPI_BASE_URL/api/health"'
```
