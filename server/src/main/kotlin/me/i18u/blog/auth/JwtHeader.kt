package me.i18u.blog.auth

import kotlinx.serialization.Serializable

@Serializable
data class JwtHeader(
    val alg: String,
    val typ: String,
) {
    companion object {
        fun default(): JwtHeader {
            return JwtHeader("HS256", "JWT")
        }
    }
}
