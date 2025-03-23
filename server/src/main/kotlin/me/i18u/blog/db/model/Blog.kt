package me.i18u.blog.db.model

import java.time.Instant
import java.util.UUID

data class Blog(val id: UUID, val title: String, val createdAt: Instant, val content: String, val archived: Boolean)