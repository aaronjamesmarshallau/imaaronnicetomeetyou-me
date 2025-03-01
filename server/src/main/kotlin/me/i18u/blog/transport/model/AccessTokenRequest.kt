package me.i18u.blog.transport.model

import kotlinx.serialization.Serializable

@Serializable
data class AccessTokenRequest(val refreshToken: String)