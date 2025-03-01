package me.i18u.blog.transport.model

import kotlinx.serialization.Serializable

@Serializable
data class UserRegisterRequest(val email: String, val password: String)
