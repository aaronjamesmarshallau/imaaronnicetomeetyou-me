package me.i18u.blog.transport.model

import kotlinx.serialization.Serializable

@Serializable
data class UserLoginResponse(val refreshToken: String, val accessToken: String)
