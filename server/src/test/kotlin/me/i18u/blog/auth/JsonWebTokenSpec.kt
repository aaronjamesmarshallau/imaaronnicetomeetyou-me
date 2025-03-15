package me.i18u.blog.auth

import io.kotest.assertions.arrow.core.shouldBeRight
import io.kotest.core.spec.style.FunSpec
import java.time.Instant

class JsonWebTokenSpec : FunSpec({
    test("creation and validation are compatible") {
        val jwt = JsonWebToken.create(
            JwtHeader.default(),
            JwtPayload(
                sub = "test",
                name = "Test",
                expiry = Instant.now().epochSecond
            )
        )

        jwt.validate().shouldBeRight()
    }
})