package me.i18u.blog.routing

import arrow.core.Either
import arrow.core.Either.Left
import arrow.core.Either.Right
import arrow.core.None
import arrow.core.Option
import arrow.core.Some
import arrow.core.flatMap
import arrow.core.left
import arrow.core.right
import arrow.core.some
import de.mkammerer.argon2.Argon2
import io.ktor.server.application.Application
import io.ktor.server.engine.logError
import io.ktor.server.request.receive
import io.ktor.server.response.respondText
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import me.i18u.blog.AuthError
import me.i18u.blog.DataError
import me.i18u.blog.EncryptionError
import me.i18u.blog.Error
import me.i18u.blog.SqlError
import me.i18u.blog.auth.JsonWebToken
import me.i18u.blog.auth.JwtHeader
import me.i18u.blog.auth.JwtPayload
import me.i18u.blog.db.TokenEntry
import me.i18u.blog.db.abstraction.TokenRepository
import me.i18u.blog.db.abstraction.UserRepository
import me.i18u.blog.db.model.UserCreate
import me.i18u.blog.db.model.Email
import me.i18u.blog.db.model.User
import me.i18u.blog.transport.model.AccessTokenRequest
import me.i18u.blog.transport.model.AccessTokenResponse
import me.i18u.blog.transport.model.UserLoginRequest
import me.i18u.blog.transport.model.UserLoginResponse
import me.i18u.blog.transport.model.UserRegisterRequest
import me.i18u.blog.transport.model.UserRegisterResponse
import java.time.Instant
import java.util.UUID
import kotlin.random.Random
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.toKotlinUuid

private const val REFRESH_TOKEN_LENGTH: Int = 20


@OptIn(ExperimentalUuidApi::class)
class AuthRouter(val argon2: Argon2, val userRepository: UserRepository, val tokenRepository: TokenRepository) {

    fun addRoutes(application: Application): Unit {
        application.routing {
            route("/api/auth") {
                register()
                login()
                token()
                logout()
            }
        }
    }

    fun Route.register(): Route {
        return post("/register") {
            val request = call.receive<UserRegisterRequest>()
            val password = request.password.toCharArray()

            val errorOrUser: Either<Error, UUID> = Either.catch { argon2.hash(10, 65536, 1, password) }
                .map { hash -> UserCreate(request.email, hash) }
                .mapLeft { throwable -> EncryptionError.UnknownError(throwable.some()) }
                .flatMap { userCreate -> userRepository.createUser(userCreate) }

            when (errorOrUser) {
                is Left -> {
                    val error = errorOrUser.value

                    when (error) {
                        is EncryptionError -> call.respondText("encryption fuckies")
                        is SqlError -> call.respondText("sql fuckies")
                        is DataError -> call.respondText("data fuckies")
                        is AuthError -> call.respondText("auth fuckies")
                    }
                }
                is Right -> {
                    val userId = errorOrUser.value
                    val response = UserRegisterResponse(userId.toKotlinUuid())

                    call.respond(response)
                }
            }
        }
    }

    fun Route.login(): Route {
        return post("/login") {
            val request = call.receive<UserLoginRequest>()
            val email = Email(request.email);
            val password = request.password;
            val remember = request.remember;

            val errorOrMaybeUser: Either<Error, Option<User>> = userRepository.getUser(email)

            val errorOrUserLoginResponse = errorOrMaybeUser
                // Convert missing user to error case
                .flatMap { maybeUser -> maybeUser.toEither { DataError.NotFound(None) } }
                // Check the queried password against our incoming password
                .flatMap { user ->
                    Either
                        .catch {
                            argon2.verify(user.passwordHash, password.toByteArray(Charsets.UTF_8))
                        }
                        .mapLeft { throwable -> EncryptionError.UnknownError(throwable.some()) }
                        .flatMap { shouldLogIn ->
                            if (shouldLogIn) {
                                user.right()
                            } else {
                                AuthError.UnsuccessfulLogin(None).left()
                            }
                        }
                }
                .flatMap { user ->
                    val characters = "0123456789ABCDEF"
                    val refreshToken = (0.rangeUntil(REFRESH_TOKEN_LENGTH)).map { characters[Random.nextInt(0, characters.length)] }.joinToString("")
                    val accessToken = JsonWebToken.create(
                        JwtHeader.default(),
                        JwtPayload(user.id.toString(), user.email, Instant.now().plusSeconds(60).toEpochMilli() / 1000)
                    )

                    tokenRepository.addToken(user.id, refreshToken, remember)
                        .map { UserLoginResponse(refreshToken, accessToken.toString()) }
                }

            when (errorOrUserLoginResponse) {
                is Left -> {
                    val error = errorOrUserLoginResponse.value

                    error.cause.onSome { logError(call, it) }

                    when (error) {
                        is EncryptionError -> call.respondText("encryption fuckies")
                        is SqlError -> call.respondText("sql fuckies")
                        is DataError -> call.respondText("data fuckies")
                        is AuthError -> call.respondText("auth fuckies")
                    }
                }
                is Right -> {
                    val tokenPair = errorOrUserLoginResponse.value

                    call.respond(tokenPair)
                }
            }
        }
    }

    fun Route.token(): Route {
        return post("/token") {
            val request = call.receive<AccessTokenRequest>()
            val refreshToken = request.refreshToken

            // Verify refresh token exists and not expired
            val errorOrMaybeToken: Either<Error, Option<TokenEntry>> = tokenRepository.getToken(refreshToken)

            val errorOrAccessToken = errorOrMaybeToken
                // Handle missing token
                .flatMap { maybeTokenEntry ->
                    when (maybeTokenEntry) {
                        is Some -> maybeTokenEntry.value.right()
                        is None -> AuthError.InvalidToken(None).left()
                    }
                }
                // Handle expired token
                .flatMap { tokenEntry ->
                    if (tokenEntry.expiresAt < Instant.now()) {
                        AuthError.ExpiredToken(None).left()
                    } else {
                        tokenEntry.right()
                    }
                }
                // Grab user
                .flatMap { tokenEntry ->
                    userRepository.getUser(tokenEntry.userId)
                        .flatMap { maybeUser ->
                            when (maybeUser) {
                                is None -> DataError.NotFound(None).left()
                                is Some -> maybeUser.value.right()
                            }
                        }
                }
                // Issue new access token
                .map { user ->
                    val accessToken = JsonWebToken.create(
                        JwtHeader.default(),
                        JwtPayload(user.id.toString(), user.email, Instant.now().plusSeconds(60).toEpochMilli() / 1000)
                    )

                    AccessTokenResponse(accessToken.toString())
                }

            when (errorOrAccessToken) {
                is Left -> {
                    val error = errorOrAccessToken.value

                    error.cause.onSome { logError(call, it) }

                    when (error) {
                        is EncryptionError -> call.respondText("encryption fuckies")
                        is SqlError -> call.respondText("sql fuckies")
                        is DataError -> call.respondText("data fuckies")
                        is AuthError -> call.respondText("auth fuckies")
                    }
                }
                is Right -> {
                    val tokenPair = errorOrAccessToken.value

                    call.respond(tokenPair)
                }
            }
        }
    }

    fun Route.logout(): Route {
        return post("/logout") {
            TODO("not done yet")
        }
    }
}