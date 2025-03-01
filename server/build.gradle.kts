plugins {
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.serialization") version "2.1.10"
    application
}

group = "me.i18u.blog"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

val ktorVersion = "3.0.3"
val kapperVersion = "1.2.0"
val hikariVersion = "6.2.1"
val postgresVersion = "42.6.0"
val arrowVersion = "2.0.1"
val flywayVersion = "11.3.1"
val kotlinxSerializationVersion = "1.8.0"
val logbackVersion = "1.5.16"
val argon2Version = "2.11"
val logstashLogbackVersion = "4.11"

dependencies {
    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    implementation("ch.qos.logback:logback-core:$logbackVersion")
    implementation("com.zaxxer:HikariCP:$hikariVersion")
    implementation("io.arrow-kt:arrow-core:$arrowVersion")
    implementation("io.arrow-kt:arrow-fx-coroutines:$arrowVersion")
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
    implementation("io.ktor:ktor-client-core:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
    implementation("io.ktor:ktor-server-auth:$ktorVersion")
    implementation("io.ktor:ktor-server-call-logging:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-status-pages:$ktorVersion")
    implementation("net.samyn:kapper-coroutines:$kapperVersion")
    implementation("net.samyn:kapper:$kapperVersion")
    implementation("org.flywaydb:flyway-core:$flywayVersion")
    implementation("org.flywaydb:flyway-database-postgresql:$flywayVersion")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:$kotlinxSerializationVersion")
    implementation("org.postgresql:postgresql:$postgresVersion")
    implementation("de.mkammerer:argon2-jvm-nolibs:$argon2Version")
    implementation("de.mkammerer:argon2-jvm-nolibs:$argon2Version")
    implementation("net.logstash.logback:logstash-logback-encoder:$logstashLogbackVersion")

    testImplementation(kotlin("test"))
}

application {
    mainClass.set("me.i18u.blog.MainKt")
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(21)
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_2)
    }
}