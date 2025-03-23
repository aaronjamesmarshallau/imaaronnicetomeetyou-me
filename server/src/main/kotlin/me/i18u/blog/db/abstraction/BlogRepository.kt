package me.i18u.blog.db.abstraction

import arrow.core.Either
import arrow.core.Option
import me.i18u.blog.SqlError
import me.i18u.blog.db.model.Blog
import me.i18u.blog.db.model.BlogCreate
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

interface BlogRepository {
    suspend fun getBlogs(includeArchived: Boolean): Either<SqlError, List<Blog>>;
    @OptIn(ExperimentalUuidApi::class)
    suspend fun getBlog(blogId: Uuid): Either<SqlError, Option<Blog>>;
    @OptIn(ExperimentalUuidApi::class)
    suspend fun createBlog(blogData: BlogCreate): Either<SqlError, Uuid>;
    @OptIn(ExperimentalUuidApi::class)
    suspend fun deleteBlog(blogId: Uuid): Either<SqlError, Unit>;

}