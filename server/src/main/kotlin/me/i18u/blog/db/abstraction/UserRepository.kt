package me.i18u.blog.db.abstraction

import arrow.core.Either
import arrow.core.Option
import me.i18u.blog.SqlError
import me.i18u.blog.db.model.User
import me.i18u.blog.db.model.UserCreate
import me.i18u.blog.db.model.Email
import java.util.UUID

interface UserRepository {
    suspend fun createUser(user: UserCreate): Either<SqlError, UUID>
    suspend fun getUser(email: Email): Either<SqlError, Option<User>>
    suspend fun getUser(id: UUID): Either<SqlError, Option<User>>
}