FROM gradle:8.10-jdk21 AS build

# Set the working directory
WORKDIR /app

# Copy the project files
COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle ./gradle
COPY src ./src

# Build the application
RUN gradle shadowJar --no-daemon

# Use the official OpenJDK runtime as the base image
FROM eclipse-temurin:21-jre-alpine AS prod

# Set the working directory
WORKDIR /app

# Install Curl for healthcheck
RUN apk --no-cache add curl argon2 argon2-dev

# Copy the JAR file from the build stage
COPY --from=build /app/build/libs/*.jar /app/application.jar

EXPOSE 5174

# Command to run the application
CMD ["java", "-jar", "/app/application.jar"]
