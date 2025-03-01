package me.i18u.blog.routing.abstraction

import io.ktor.server.application.Application
import io.ktor.server.engine.EmbeddedServer

/**
 * Interface for a router that applies routes to a server.
 */
interface Router {
    /**
     * Add routes to the provided [EmbeddedServer].
     */
    fun Application.routes()
}