package me.i18u.blog.auth

import arrow.core.Either
import arrow.core.None
import arrow.core.left
import arrow.core.right
import kotlinx.serialization.json.Json
import me.i18u.blog.DataError
import me.i18u.blog.Error
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

private const val HASH_ALGORITHM = "HmacSHA256"

data class JsonWebToken(val header: String, val payload: String, val signature: String) {
    override fun toString(): String {
        val stringBuilder = StringBuilder(header.length + payload.length + signature.length + 2)
        stringBuilder.append(header)
        stringBuilder.append(".")
        stringBuilder.append(payload)
        stringBuilder.append(".")
        stringBuilder.append(signature)
        return stringBuilder.toString()
    }

    fun getPayload(): Either<Error, JwtPayload> {
        val decodedPayload = Base64.getDecoder().decode(payload).toString(Charsets.UTF_8)
        val payload = Either.catch {
            Json.decodeFromString<JwtPayload>(decodedPayload)
        }.mapLeft { throwable -> DataError.BadFormat("The provided JWT payload is malformed.", None) }

        return payload
    }

    companion object {
        const val SECRET = "example_secret_key"

        fun create(header: JwtHeader, payload: JwtPayload): JsonWebToken {
            val headerJson = Json.encodeToString(header)
            val payloadJson = Json.encodeToString(payload)

            val encodedHeader = Base64.getEncoder().encode(headerJson.toByteArray(Charsets.UTF_8))
            val encodedPayload = Base64.getEncoder().encode(payloadJson.toByteArray(Charsets.UTF_8))

            val hs256 = Mac.getInstance(HASH_ALGORITHM)
            val secretKeySpec = SecretKeySpec(SECRET.toByteArray(Charsets.UTF_8), HASH_ALGORITHM)

            hs256.init(secretKeySpec) // Vom

            val signature = hs256.doFinal(encodedHeader + ".".toByteArray(Charsets.UTF_8) + encodedPayload)
            val encodedSignature = Base64.getEncoder().encode(signature)

            return JsonWebToken(
                encodedHeader.toString(Charsets.UTF_8),
                encodedPayload.toString(Charsets.UTF_8),
                encodedSignature.toString(Charsets.UTF_8)
            )
        }

        fun parse(tokenBlob: String): Either<DataError, JsonWebToken> {
            val parts = tokenBlob.split(".")

            if (parts.size != 3) {
                return DataError.BadFormat("The token is not of the required format.", None).left()
            }

            val header = parts[0]
            val payload = parts[1]
            val signature = parts[2]

            return JsonWebToken(header, payload, signature).right()
        }
    }
}
