package me.i18u.blog.db.model

data class UserCreate(
    val email: String,
    val passwordHash: String
)
