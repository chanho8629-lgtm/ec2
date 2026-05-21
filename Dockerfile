# 빌드 할 때에는 jdk 17버전을 사용하겠다.
FROM eclipse-temurin:17-jdk AS build

ARG EC2_HOST
ENV EC2_HOST=${EC2_HOST}

ARG PSQL_PORT
ENV PSQL_PORT=${PSQL_PORT}

ARG PSQL_DATABASE
ENV PSQL_DATABASE=${PSQL_DATABASE}

ARG PSQL_USERNAME
ENV PSQL_USERNAME=${PSQL_USERNAME}

ARG PSQL_PASSWORD
ENV PSQL_PASSWORD=${PSQL_PASSWORD}

ARG REDIS_PORT
ENV REDIS_PORT=${REDIS_PORT}

ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

ARG AWS_ACCESS_KEY
ENV AWS_ACCESS_KEY=${AWS_ACCESS_KEY}

ARG AWS_SECRET_KEY
ENV AWS_SECRET_KEY=${AWS_SECRET_KEY}

ARG AWS_BUCKET_NAME
ENV AWS_BUCKET_NAME=${AWS_BUCKET_NAME}

ARG AWS_REGION
ENV AWS_REGION=${AWS_REGION}

ARG KAKAO_CLIENT_ID
ENV KAKAO_CLIENT_ID=${KAKAO_CLIENT_ID}

ARG KAKAO_CLIENT_SECRET
ENV KAKAO_CLIENT_SECRET=${KAKAO_CLIENT_SECRET}

ARG NAVER_CLIENT_ID
ENV NAVER_CLIENT_ID=${NAVER_CLIENT_ID}

ARG NAVER_CLIENT_SECRET
ENV NAVER_CLIENT_SECRET=${NAVER_CLIENT_SECRET}

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

ARG BOOTPAY_JS_API_KEY
ENV BOOTPAY_JS_API_KEY=${BOOTPAY_JS_API_KEY}

ARG BOOTPAY_REST_API_KEY
ENV BOOTPAY_REST_API_KEY=${BOOTPAY_REST_API_KEY}

ARG BOOTPAY_PRIVATE_KEY
ENV BOOTPAY_PRIVATE_KEY=${BOOTPAY_PRIVATE_KEY}

ARG SPRING_MAIL_USERNAME
ENV SPRING_MAIL_USERNAME=${SPRING_MAIL_USERNAME}

ARG SPRING_MAIL_PASSWORD
ENV SPRING_MAIL_PASSWORD=${SPRING_MAIL_PASSWORD}

ARG APP_MAIL_FROM_ADDRESS
ENV APP_MAIL_FROM_ADDRESS=${APP_MAIL_FROM_ADDRESS}

ARG SOLAPI_API_KEY
ENV SOLAPI_API_KEY=${SOLAPI_API_KEY}

ARG SOLAPI_API_SECRET
ENV SOLAPI_API_SECRET=${SOLAPI_API_SECRET}

ARG SOLAPI_FROM_NUMBER
ENV SOLAPI_FROM_NUMBER=${SOLAPI_FROM_NUMBER}

ARG ML_API_BASE_URL
ENV ML_API_BASE_URL=${ML_API_BASE_URL}

ARG FASTAPI_BASE_URL
ENV FASTAPI_BASE_URL=${FASTAPI_BASE_URL}

WORKDIR /app

# Gradle 빌드에 필요한 파일만 복사 (pkl 등 불필요한 대용량 파일 제외)
COPY build.gradle settings.gradle gradlew ./
COPY gradle/ ./gradle/
COPY src/ ./src/

# 배포 이미지는 실행 JAR만 필요하므로 테스트는 CI/로컬 검증에서 수행한다.
RUN chmod +x ./gradlew && \
    ./gradlew bootJar -x test --no-daemon && \
    rm -rf /root/.gradle /app/.gradle

FROM python:3.11-slim AS fastapi-runtime

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY fastapi/basic/requirements-container.txt ./requirements-container.txt
RUN python -m venv /opt/bideo-ai && \
    /opt/bideo-ai/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/bideo-ai/bin/pip install --no-cache-dir -r ./requirements-container.txt

# 실행은 기존 Java 17 JRE 이미지에서 한다.
FROM eclipse-temurin:17-jre

ENV TZ=Asia/Seoul
ENV FASTAPI_BASE_URL=http://127.0.0.1:8000

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl libgomp1 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=fastapi-runtime /usr/local /usr/local
COPY --from=fastapi-runtime /opt/bideo-ai /opt/bideo-ai

# JAR 및 FastAPI 코드 복사 (models/는 .dockerignore 제외 → 볼륨 마운트로 주입)
COPY --from=build /app/build/libs/bideo-0.0.1-SNAPSHOT.jar /app/app.jar
COPY fastapi/basic/ /app/fastapi/basic/
COPY scripts/docker/start-bideo.sh /app/start-bideo.sh
RUN chmod +x /app/start-bideo.sh

# 포트 오픈
EXPOSE 10000

# 실행 명령어
ENTRYPOINT ["/app/start-bideo.sh"]
