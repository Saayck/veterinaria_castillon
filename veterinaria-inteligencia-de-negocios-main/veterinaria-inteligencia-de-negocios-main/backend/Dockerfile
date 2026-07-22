# ---------- Etapa de build (Maven + JDK 21) ----------
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
# Cachea dependencias: solo se re-descargan si cambia el pom
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Etapa de runtime (solo JRE) ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Usuario no-root
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
