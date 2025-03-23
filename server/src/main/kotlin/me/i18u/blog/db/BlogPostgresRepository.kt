package me.i18u.blog.db

import arrow.core.Either
import arrow.core.Option
import arrow.core.some
import arrow.core.toOption
import me.i18u.blog.db.abstraction.BlogRepository
import me.i18u.blog.SqlError
import me.i18u.blog.db.model.Blog
import me.i18u.blog.db.model.BlogCreate
import net.samyn.kapper.coroutines.withConnection
import net.samyn.kapper.execute
import net.samyn.kapper.query
import net.samyn.kapper.querySingle
import org.slf4j.Logger
import javax.sql.DataSource
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.uuid.toJavaUuid

class BlogPostgresRepository(val db: DataSource, val logger: Logger) : BlogRepository {
    override suspend fun getBlogs(includeArchived: Boolean): Either<SqlError, List<Blog>> {
        return db.withConnection { connection ->
            Either.catch {
                if (includeArchived) {
                    connection.query<Blog>("SELECT id, title, created_at as createdAt, content, archived FROM blogs ORDER BY created_at DESC;")
                } else {
                    connection.query<Blog>("SELECT id, title, created_at as createdAt, content, archived FROM blogs WHERE archived = false ORDER BY created_at DESC;")
                }
            }
                .mapLeft { throwable -> SqlError.UnknownError("An unknown error occurred.", throwable.some()) }
        }
    }

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun getBlog(uuid: Uuid): Either<SqlError, Option<Blog>> {
        return db.withConnection { connection ->
            Either.catch { connection.querySingle<Blog>("SELECT id, title, created_at as createdAt, content, archived FROM blogs WHERE id = :id", "id" to uuid.toJavaUuid()).toOption() }
                .mapLeft { throwable -> SqlError.UnknownError("An unknown error occurred", throwable.some()) }
        }
    }

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun createBlog(blogCreate: BlogCreate): Either<SqlError, Uuid> {
        return db.withConnection { connection ->
            Either.catch {
                connection.querySingle<Uuid>(
                    "INSERT INTO blogs(title, content) VALUES(:title, :content) RETURNING id;",
                    { resultSet, fields ->
                        Uuid.parse(resultSet.getString(1))
                    },
                    "title" to blogCreate.title,
                    "content" to blogCreate.content
                )!! // This will either fail to create, causing an error, or return the ID.
            }.mapLeft { throwable -> SqlError.UnknownError("An unknown error occurred", throwable.some()) }
        }
    }

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun deleteBlog(blogId: Uuid): Either<SqlError, Unit> {
        return db.withConnection { connection ->
            Either.catch { connection.execute("UPDATE blogs SET archived = true WHERE id = :id", "id" to blogId.toJavaUuid()) }
                .mapLeft { throwable -> SqlError.UnknownError("An unknown error occurred", throwable.some()) }
                .map { } // Drop the affected row count
        }
    }
}