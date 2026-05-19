FROM eclipse-temurin:17-jre

ENV TZ=Asia/Seoul

WORKDIR /app

COPY build/libs/bideo-*-SNAPSHOT.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]
