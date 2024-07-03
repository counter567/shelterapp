package de.felix.shelterapp.auth

import de.felix.shelterapp.util.coroutineAsUni
import de.felix.shelterapp.util.getType
import io.smallrye.jwt.auth.principal.JWTParser
import io.smallrye.mutiny.Uni
import io.vertx.core.http.HttpServerRequest
import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.inject.Default
import jakarta.ws.rs.container.ContainerRequestContext
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.ext.Provider
import org.eclipse.microprofile.jwt.JsonWebToken
import org.jboss.resteasy.reactive.server.ServerRequestFilter
import kotlin.jvm.optionals.getOrNull

@Provider
@ApplicationScoped
class AuthRequestFilters(
    private val blacklist: RefreshTokenBlacklist,
    private val jwtParser: JWTParser
) {


    @Context
    @field: Default
    private lateinit var httpServerRequest: HttpServerRequest

    @ServerRequestFilter(preMatching = true)
    fun checkToken(requestContext: ContainerRequestContext): Uni<Response?> = coroutineAsUni {
        val ipAddress = httpServerRequest.getIpAddressOrHeader()
        val jwt = requestContext.headers.getFirst("Authorization")?: return@coroutineAsUni null

        val parsedToken = jwtParser.parse(jwt.substring(7))
        if(parsedToken.getType() != TokenType.REFRESH && !blacklist.check(parsedToken)) {
            println("Rejected token from $ipAddress because it is blacklisted")
            return@coroutineAsUni Response.status(Response.Status.UNAUTHORIZED).build()
        }
        if(!checkIpAddress(parsedToken, ipAddress)) {
            println("IP Address mismatch: $ipAddress != ${parsedToken.claim<String>("ipAddress").getOrNull()}")
            return@coroutineAsUni Response.status(Response.Status.UNAUTHORIZED).build()
        }
        return@coroutineAsUni null
    }

    private fun checkIpAddress(token: JsonWebToken, ipAddress: String): Boolean {
        val tokenIpAddress = token.claim<String>("ipAddress").getOrNull()?: return true
        return ipAddress == tokenIpAddress
    }

    private fun HttpServerRequest.getIpAddressOrHeader() =
        this.headers().get("X-Forwarded-For") ?: this.remoteAddress().host()
}