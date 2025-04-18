package me.i18u.blog.routing

import arrow.core.Either.Left
import arrow.core.Either.Right
import arrow.core.None
import arrow.core.Some
import arrow.core.flatMap
import arrow.core.left
import arrow.core.right
import arrow.core.toOption
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import me.i18u.blog.AuthError
import me.i18u.blog.DataError
import me.i18u.blog.EncryptionError
import me.i18u.blog.SqlError
import me.i18u.blog.auth.JsonWebToken
import me.i18u.blog.db.abstraction.BlogRepository
import me.i18u.blog.transport.model.Blog
import me.i18u.blog.transport.model.BlogCreateRequest
import me.i18u.blog.transport.model.BlogCreateResponse
import org.slf4j.Logger
import java.time.Instant
import java.util.logging.LogManager
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
class BlogsRouter(val blogRepository: BlogRepository, val logger: Logger)  {
    fun addRoutes(application: Application): Unit {
        application.routing {
            route("/api/blogs") {
                createBlog()
                listBlogs()
                getBlog()
                deleteBlog()
            }
        }
    }

    private fun Route.listBlogs() {
        get {
            val includeArchived = call.queryParameters["include_archived"] == "true"
            val result = blogRepository.getBlogs(includeArchived)

            when (result) {
                is Right -> {
                    val dbBlogs = result.value
                    val transportBlogs = dbBlogs.map { Blog.fromDatabase(it) }

                    call.respond(transportBlogs)
                }
                is Left -> {
                    logger.error(result.value.toString())
                    call.respondText("sql fuckies")
                }
            }
        }
    }

    private fun Route.getBlog() {
        get("/{id}") {
            val result = blogRepository.getBlog(Uuid.parse(call.parameters["id"]!!))

            when (result) {
                is Right -> {
                    val dbBlog = result.value
                    val transportBlog = dbBlog.map { Blog.fromDatabase(it) }

                    when (transportBlog) {
                        is Some -> call.respond(transportBlog.value)
                        else -> call.respond(HttpStatusCode.NotFound)
                    }
                }
                is Left -> {
                    logger.error(result.value.toString())
                    call.respondText("sql fuckies")
                }
            }
        }
    }

    private fun Route.deleteBlog() {
        delete("/{id}") {
            val errorOrAuthorization = call.request.headers["Authorization"]
                .toOption()
                .toEither { DataError.NotFound(None) }

            val result = errorOrAuthorization
                // Replace "Bearer " in auth header
                .map { authHeader -> authHeader.replace("Bearer ", "") }
                // Parse token to object
                .flatMap { token -> JsonWebToken.parse(token) }
                .flatMap { jwt -> jwt.validate() }
                // Get payload
                .flatMap { jwt -> jwt.getPayload() }
                // Check expiry on payload
                .map { payload -> Instant.ofEpochSecond(payload.expiry) > Instant.now() }
                // lift expiry into error
                .flatMap { isLoggedIn ->
                    isLoggedIn.fold(
                        { Unit.right() },
                        { AuthError.ExpiredToken(None).left() }
                    )
                }
                .flatMap {
                    blogRepository.deleteBlog(Uuid.parse(call.parameters["id"]!!))
                }

            when (result) {
                is Right -> {
                    call.respond(HttpStatusCode.OK)
                }
                is Left -> {
                    val error = result.value

                    logger.error(error.toString())

                    when (error) {
                        is EncryptionError -> call.respondText("encryption fuckies")
                        is SqlError -> call.respondText("sql fuckies")
                        is DataError -> call.respondText("data fuckies")
                        is AuthError -> call.respondText("auth fuckies")
                    }
                }
            }
        }
    }

    /**
     * Fold over the boolean, providing values for both true and false.
     */
    fun <A> Boolean.fold(ifTrue: () -> A, ifFalse: () -> A): A {
        return if (this) ifTrue() else ifFalse()
    }

    private fun Route.createBlog() {
        post {
            val blogCreateRequest = call.receive<BlogCreateRequest>()
            val errorOrAuthorization = call.request.headers["Authorization"]
                .toOption()
                .toEither { DataError.NotFound(None) }

            val result = errorOrAuthorization
                // Replace "Bearer " in auth header
                .map { authHeader -> authHeader.replace("Bearer ", "") }
                // Parse token to object
                .flatMap { token -> JsonWebToken.parse(token) }
                .flatMap { jwt -> jwt.validate() }
                // Get payload
                .flatMap { jwt -> jwt.getPayload() }
                // Check expiry on payload
                .map { payload -> Instant.ofEpochSecond(payload.expiry) > Instant.now() }
                // lift expiry into error
                .flatMap { isLoggedIn ->
                    isLoggedIn.fold(
                        { Unit.right() },
                        { AuthError.ExpiredToken(None).left() }
                    )
                }
                // create blog
                .flatMap {
                    blogRepository.createBlog(blogCreateRequest.toDatabase())
                }

            when (result) {
                is Right -> {
                    val id = result.value

                    call.respond(BlogCreateResponse(id))
                }
                is Left -> {
                    val error = result.value

                    logger.error(error.toString())

                    when (error) {
                        is EncryptionError -> call.respondText("encryption fuckies")
                        is SqlError -> call.respondText("sql fuckies")
                        is DataError -> call.respondText("data fuckies")
                        is AuthError -> call.respondText("auth fuckies")
                    }
                }
            }
        }
    }
}