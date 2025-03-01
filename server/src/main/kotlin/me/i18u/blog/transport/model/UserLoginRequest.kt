package me.i18u.blog.transport.model

import kotlinx.serialization.Serializable

@Serializable
data class UserLoginRequest(val email: String, val password: String, val remember: Boolean)
