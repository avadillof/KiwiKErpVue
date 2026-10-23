FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml ./
COPY src ./src
RUN mvn -B package

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN mkdir /data && chown 10001:10001 /data
COPY --from=build /build/target/K_CLIENTES.jar /app/app.jar
USER 10001:10001
ENV CLIENT_MANAGER_BIND=0.0.0.0 CLIENT_MANAGER_DATABASE=/data/clients.db
EXPOSE 9084
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
