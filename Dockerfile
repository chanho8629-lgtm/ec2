# 빌드 스테이지 - 테스트 제외하고 JAR만 생성
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app
COPY . .
RUN chmod +x ./gradlew && ./gradlew build -x test

# 런타임 스테이지
FROM eclipse-temurin:17-jre

ENV TZ=Asia/Seoul

COPY --from=build /app/build/libs/bideo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]














