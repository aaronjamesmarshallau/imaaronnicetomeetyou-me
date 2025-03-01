package me.i18u.blog.db.model

import java.time.Instant
import java.util.UUID

data class User(
    val id: UUID,
    val email: String,
    val passwordHash: String,
    val createdAt: Instant,
    val updatedAt: Instant
)
