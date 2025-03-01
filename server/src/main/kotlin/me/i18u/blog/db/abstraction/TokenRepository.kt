package me.i18u.blog.db.abstraction

import arrow.core.Either
import arrow.core.Option
import me.i18u.blog.SqlError
import me.i18u.blog.db.TokenEntry
import java.util.UUID
import kotlin.uuid.ExperimentalUuidApi

@OptIn(ExperimentalUuidApi::class)
interface TokenRepository {
    suspend fun addToken(userId: UUID, refresh: String, extended: Boolean): Either<SqlError, Unit>
    suspend fun getToken(refreshToken: String): Either<SqlError, Option<TokenEntry>>
}