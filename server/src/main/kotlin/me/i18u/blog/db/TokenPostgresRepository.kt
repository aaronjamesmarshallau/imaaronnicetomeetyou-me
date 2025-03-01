package me.i18u.blog.db

import arrow.core.Either
import arrow.core.Option
import arrow.core.toOption
import me.i18u.blog.SqlError
import me.i18u.blog.db.abstraction.TokenRepository
import net.samyn.kapper.execute
import net.samyn.kapper.querySingle
import java.time.Duration
import java.time.Instant
import java.util.UUID
import javax.sql.DataSource

data class TokenEntry(val id: UUID, val userId: UUID, val refreshToken: String, val createdAt: Instant, val expiresAt: Instant)

class TokenPostgresRepository(val db: DataSource): TokenRepository {
    override suspend fun addToken(
        userId: UUID,
        refresh: String,
        extended: Boolean
    ): Either<SqlError, Unit> {
        val expiry = if (extended) {
            Instant.now().plus(Duration.ofDays(1))
        } else {
            Instant.now().plus(Duration.ofDays(30))
        }

        return db.withConnectionCatching { connection ->
            connection.execute(
                """
                INSERT INTO tokens (user_id, refresh_token, expires_at)
                VALUES (:userId, :token, :expiresAt);
                """.trimIndent(),
                "userId" to userId,
                "token" to refresh,
                "expiresAt" to expiry
            )
        }
    }

    override suspend fun getToken(refreshToken: String): Either<SqlError, Option<TokenEntry>> {
        return db.withConnectionCatching { connection ->
            connection.querySingle<TokenEntry>(
                """
                SELECT 
                    id, 
                    user_id as userId, 
                    refresh_token as refreshToken, 
                    created_at as createdAt,
                    expires_at as expiresAt
                FROM tokens
                WHERE refresh_token = :token
                """.trimIndent(),
                "token" to refreshToken
            ).toOption()
        }
    }

}