package me.i18u.blog.db

import arrow.core.Either
import arrow.core.Option
import arrow.core.some
import arrow.core.toOption
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import me.i18u.blog.db.abstraction.UserRepository
import me.i18u.blog.SqlError
import me.i18u.blog.db.model.User
import me.i18u.blog.db.model.UserCreate
import me.i18u.blog.db.model.Email
import net.samyn.kapper.coroutines.withConnection
import net.samyn.kapper.querySingle
import org.slf4j.Logger
import java.util.UUID
import javax.sql.DataSource
import kotlin.coroutines.coroutineContext

data class Identifier(val id: UUID)

public suspend fun <T> DataSource.withConnectionCatching(block: suspend (java.sql.Connection) -> T): Either<SqlError, T> {
    return Either.catch {
        withConnection(coroutineContext) { connection ->
            block(connection)
        }
    }.mapLeft { throwable ->
        if (throwable.message?.contains("constraint") == true) {
            SqlError.ConstraintViolationError("Constraint violated during query", throwable.some())
        } else {
            SqlError.UnknownError("Unknown error occurred while creating user.", throwable.some())
        }
    }
}

class UserPostgresRepository(val db: DataSource, val logger: Logger) : UserRepository {
    override suspend fun createUser(userData: UserCreate): Either<SqlError, UUID> {
        return db.withConnectionCatching { connection ->
            connection.querySingle<Identifier>(
                """
                INSERT INTO users (email, password_hash) 
                VALUES (:email, :passwordHash) 
                RETURNING id;
                """.trimIndent(),
                "email" to userData.email,
                "passwordHash" to userData.passwordHash
            )!!.id
        }
    }

    override suspend fun getUser(email: Email): Either<SqlError, Option<User>> {
        return db.withConnectionCatching { connection ->
            connection.querySingle<User>(
                """
                SELECT id, email, password_hash as passwordHash, created_at as createdAt, updated_at as updatedAt
                FROM users
                WHERE email = :email;
                """.trimIndent(),
                "email" to email.value
            ).toOption()
        }
    }

    override suspend fun getUser(id: UUID): Either<SqlError, Option<User>> {
        return db.withConnectionCatching { connection ->
            connection.querySingle<User>(
                """
                SELECT id, email, password_hash as passwordHash, created_at as createdAt, updated_at as updatedAt
                FROM users
                WHERE id = :id;
                """.trimIndent(),
                "id" to id
            ).toOption()
        }
    }
}