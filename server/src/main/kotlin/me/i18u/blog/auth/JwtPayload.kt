package me.i18u.blog.auth

import kotlinx.serialization.Serializable

@Serializable
data class JwtPayload(
    val sub: String,
    val name: String,
    /**
     * Represented as epoch seconds (not millis)
     */
    val expiry: Long,
)
