package me.i18u.blog.transport.model

import kotlinx.serialization.Serializable
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.uuid.toKotlinUuid

typealias DbBlog = me.i18u.blog.db.model.Blog

@OptIn(ExperimentalUuidApi::class)
@Serializable
data class Blog(val blogId: Uuid, val title: String, val createdAt: String, val content: String) {
    companion object {
        @OptIn(ExperimentalUuidApi::class)
        fun fromDatabase(blog: DbBlog): Blog {
            return Blog(blog.id.toKotlinUuid(), blog.title, blog.createdAt.toString(), blog.content)
        }
    }
}
