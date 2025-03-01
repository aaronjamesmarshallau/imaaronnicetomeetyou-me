package me.i18u.blog.transport.model

import kotlinx.serialization.Serializable
import me.i18u.blog.db.model.BlogCreate

@Serializable
data class BlogCreateRequest(val title: String, val content: String) {
    fun toDatabase(): BlogCreate {
        return BlogCreate(this.title, this.content)
    }
}