package me.i18u.blog

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import de.mkammerer.argon2.Argon2Factory
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import me.i18u.blog.db.BlogPostgresRepository
import me.i18u.blog.db.TokenPostgresRepository
import me.i18u.blog.db.UserPostgresRepository
import me.i18u.blog.routing.AuthRouter
import me.i18u.blog.routing.BlogsRouter
import org.flywaydb.core.Flyway
import org.slf4j.LoggerFactory
import org.slf4j.event.Level
import kotlin.uuid.ExperimentalUuidApi

val ServerContentNegotiation = io.ktor.server.plugins.contentnegotiation.ContentNegotiation

@ExperimentalUuidApi
fun main() {
    val dbHost = System.getenv("DB_HOST")
    val dbUser = System.getenv("DB_USER")
    val dbPort = System.getenv("DB_PORT")
    val dbPass = System.getenv("DB_PASS")
    val dbDatabase = System.getenv("DB_DATABASE")
    val logger = LoggerFactory.getLogger("application")

    // Db Setup
    val config = HikariConfig().apply {
        jdbcUrl = "jdbc:postgresql://$dbHost:$dbPort/$dbDatabase" // Replace with your DB details
        username = dbUser // Replace with your DB username
        password = dbPass // Replace with your DB password
        driverClassName = "org.postgresql.Driver"
        maximumPoolSize = 10 // Set the pool size according to your needs
    }

    val dataSource = HikariDataSource(config)

    // Flyway
    Flyway.configure().dataSource(dataSource).load().migrate()

    val server = createServer()

    val blogRepository = BlogPostgresRepository(dataSource, logger)
    val userRepository = UserPostgresRepository(dataSource, logger)
    val tokenRepository = TokenPostgresRepository(dataSource, logger)

    val argon2 = Argon2Factory.create()

    val blogRouter = BlogsRouter(blogRepository, logger)
    val authRouter = AuthRouter(argon2, userRepository, tokenRepository, logger)

    blogRouter.addRoutes(server.application)
    authRouter.addRoutes(server.application)

    server.start(wait = true)
}

private fun createServer(): EmbeddedServer<NettyApplicationEngine, NettyApplicationEngine.Configuration> =
    embeddedServer(Netty, port = 5174) {
        install(ServerContentNegotiation) {
            json()
        }
        install(CORS) {
            allowMethod(HttpMethod.Options)
            allowMethod(HttpMethod.Put)
            allowMethod(HttpMethod.Delete)
            allowMethod(HttpMethod.Patch)
            allowMethod(HttpMethod.Post)
            allowMethod(HttpMethod.Get)
            allowHost("*", listOf("https", "http"))
            allowHeader(HttpHeaders.Authorization)
            allowHeader(HttpHeaders.AccessControlAllowOrigin)
            allowHeader(HttpHeaders.ContentType)
            allowNonSimpleContentTypes = true
            allowCredentials = true
            allowSameOrigin = true
        }
        install(StatusPages) {
            exception<Throwable> { call, throwable ->
                println(throwable)
                call.respond(HttpStatusCode.InternalServerError)
            }
        }
        install(CallLogging) {
            level = Level.INFO
        }
    }