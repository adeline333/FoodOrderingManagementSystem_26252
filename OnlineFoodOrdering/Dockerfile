FROM maven:3.9.6-eclipse-temurin-22 AS build

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:22-jdk

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080 10000

ENTRYPOINT ["java", "-Xmx300m", "-Xms128m", "-Xss512k", "-XX:+UseSerialGC", "-jar", "app.jar"]