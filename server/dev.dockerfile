FROM gradle:8.10-jdk21

RUN apt update && apt install -y argon2 libargon2-dev
