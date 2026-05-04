FROM eclipse-temurin:8-jdk-alpine
WORKDIR /app
COPY Main.java .
RUN javac Main.java
EXPOSE 8080
CMD ["java","Main"]
