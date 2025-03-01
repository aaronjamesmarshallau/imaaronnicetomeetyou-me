package me.i18u.blog

import arrow.core.Option

sealed interface Error {
    val message: String;
    val cause: Option<Throwable>;
}

sealed class SqlError(override val message: String, override val cause: Option<Throwable>) : Error {
    data class ConnectionError(override val message: String, override val cause: Option<Throwable>) : SqlError(message, cause)
    data class SyntaxError(override val message: String, override val cause: Option<Throwable>) : SqlError(message, cause)
    data class ConstraintViolationError(override val message: String, override val cause: Option<Throwable>): SqlError(message, cause)
    data class UnknownError(override val message: String, override val cause: Option<Throwable>) : SqlError(message, cause)
}

sealed class EncryptionError(override val message: String, override val cause: Option<Throwable>): Error {
    data class UnknownError(override val cause: Option<Throwable>): EncryptionError("An unknown error has occurred.", cause)
}

sealed class DataError(override val message: String, override val cause: Option<Throwable>): Error {
    data class NotFound(override val cause: Option<Throwable>): DataError("The requested resource was not found.", cause)
    data class BadFormat(override val message: String, override val cause: Option<Throwable>): DataError(message, cause)
}

sealed class AuthError(override val message: String, override val cause: Option<Throwable>): Error {
    data class UnsuccessfulLogin(override val cause: Option<Throwable>): AuthError("The login attempt was unsuccessful.", cause)
    data class InvalidToken(override val cause: Option<Throwable>): AuthError("The provided refresh token is invalid.", cause)
    data class ExpiredToken(override val cause: Option<Throwable>): AuthError("The provided refresh token has expired.", cause)
}