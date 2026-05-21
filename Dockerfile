# GitHub Actions 러너에서 미리 빌드된 app.jar를 사용한다 (EC2에서 JDK/Gradle 불필요)

FROM python:3.11-slim AS fastapi-runtime

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY fastapi/basic/requirements-container.txt ./requirements-container.txt
RUN python -m venv /opt/bideo-ai && \
    /opt/bideo-ai/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/bideo-ai/bin/pip install --no-cache-dir -r ./requirements-container.txt

FROM eclipse-temurin:17-jre

ENV TZ=Asia/Seoul
ENV FASTAPI_BASE_URL=http://127.0.0.1:8000

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl libgomp1 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=fastapi-runtime /usr/local /usr/local
COPY --from=fastapi-runtime /opt/bideo-ai /opt/bideo-ai

# 러너에서 빌드된 JAR (app.jar로 복사됨)
COPY app.jar /app/app.jar
COPY fastapi/basic/ /app/fastapi/basic/
COPY scripts/docker/start-bideo.sh /app/start-bideo.sh
RUN chmod +x /app/start-bideo.sh

EXPOSE 10000
ENTRYPOINT ["/app/start-bideo.sh"]
