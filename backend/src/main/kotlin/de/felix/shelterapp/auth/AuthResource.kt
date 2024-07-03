package de.felix.shelterapp.auth

import at.favre.lib.crypto.bcrypt.BCrypt
import de.felix.shelterapp.tenant.Tenant
import de.felix.shelterapp.user.User
import de.felix.shelterapp.user.UserRefreshToken
import de.felix.shelterapp.user.containsToken
import de.felix.shelterapp.util.*
import io.quarkus.security.Authenticated
import io.quarkus.security.UnauthorizedException
import io.smallrye.mutiny.coroutines.awaitSuspending
import io.vertx.ext.web.RoutingContext
import jakarta.enterprise.inject.Default
import jakarta.inject.Inject
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.*

@Path("auth")
@Produces(MediaType.APPLICATION_JSON)
class AuthResource {
    @Inject
    @field: Default
    private lateinit var jwt: JsonWebToken
    @Inject
    @field: Default
    private lateinit var context: RoutingContext

    @Path("login")
    @POST
    fun login(loginRequest: LoginRequest) = withPanacheSession {
        if(loginRequest.username == null)
            throw BadRequestException("Username or email must be provided")
        val parameter = if(loginRequest.username.contains("@")) {
            User::email.name
        } else {
            User::username.name
        }
        val parameters = PanacheQueryParameters(mutableListOf(
            PanacheQueryParameter(parameter, loginRequest.username)
        ))
        val usersResult = User.query(parameters)
        if(usersResult.isEmpty())
            throw UnauthorizedException()
        val user = usersResult[0]
        if(!BCrypt.verifyer().verify(loginRequest.password.toCharArray(), user.password).verified) {
            throw UnauthorizedException()
        }
        val refreshTokenId = UUID.randomUUID()
        val refreshExpirationDateTime = if (loginRequest.permanent) {
            LocalDateTime.now(ZoneId.of("UTC")).plusYears(99)
        } else {
            LocalDateTime.now(ZoneId.of("UTC")).plusDays(60)
        }
        val refreshToken = createRefreshToken(user.username, refreshTokenId, getIpFromHeaderOrContext(context), user.id, user.tenantId, refreshExpirationDateTime)
        val accessToken = createAccessToken(refreshTokenId, user.username, user.role, user.tenantId, getIpFromHeaderOrContext(context), user.id)
        val response = LoginResponse(refreshToken, accessToken)
        val refreshTokenEntry = UserRefreshToken()
        refreshTokenEntry.id = refreshTokenId
        refreshTokenEntry.expirationDate = refreshExpirationDateTime
        user.refreshTokens += refreshTokenEntry
        user.lastLogin = LocalDateTime.now(ZoneId.of("UTC"))
        user.persistAndFlush<User>().awaitSuspending()
        return@withPanacheSession response
    }

    private fun getIpFromHeaderOrContext(context: RoutingContext): String {
        return context.request().getHeader("X-Forwarded-For")?: context.request().remoteAddress().host()
    }


    @Path("refresh")
    @GET
    @Authenticated
    fun refresh() = withPanacheSession {
        val type = jwt.getType()
        if(type != TokenType.REFRESH) {
            throw UnauthorizedException()
        }
        val refreshTokenId = jwt.getId()
            ?: throw UnauthorizedException()
        val username = jwt.getUsername()
            ?: throw UnauthorizedException()

        val parameters = PanacheQueryParameters(mutableListOf(
            PanacheQueryParameter(User::username.name, username)
        ))
        val usersResult = User.query(parameters)
        if(usersResult.isEmpty())
            throw UnauthorizedException()
        val user = usersResult[0]
        if(!user.refreshTokens.containsToken(refreshTokenId)) {
            throw UnauthorizedException()
        }
        val newAccessToken = createAccessToken(refreshTokenId, user.username, user.role, user.tenantId, context.request().remoteAddress().host(), user.id)
        return@withPanacheSession RefreshResponse(newAccessToken)
    }

    @Path("logout")
    @GET
    @Authenticated
    fun logout() = withPanacheSession {
        val type = jwt.getType()
        if(type != TokenType.REFRESH) {
            return@withPanacheSession Response.status(Response.Status.UNAUTHORIZED).build()
        }
        val refreshTokenId = jwt.getId()
            ?: return@withPanacheSession Response.status(Response.Status.UNAUTHORIZED).build()
        val username =jwt.getUsername()
            ?: return@withPanacheSession Response.status(Response.Status.UNAUTHORIZED).build()

        val parameters = PanacheQueryParameters(mutableListOf(
            PanacheQueryParameter(User::username.name, username)
        ))
        val usersResult = User.query(parameters)
        if(usersResult.isEmpty())
            return@withPanacheSession Response.status(Response.Status.UNAUTHORIZED).build()
        val user = usersResult[0]
        user.refreshTokens = user.refreshTokens.filter { it.id != refreshTokenId }
        user.persistAndFlush<User>().awaitSuspending()
        return@withPanacheSession Response.ok().build()
    }

    @Path("logoutAll")
    @GET
    @Authenticated
    fun logoutAll() = withPanacheSession {
        val type = jwt.getType()
        if(type != TokenType.REFRESH) {
            return@withPanacheSession Response.status(Response.Status.UNAUTHORIZED).build()
        }
        val username = jwt.getUsername()
            ?: return@withPanacheSession Response.status(Response.Status.UNAUTHORIZED).build()

        val parameters = PanacheQueryParameters(mutableListOf(
            PanacheQueryParameter(User::username.name, username)
        ))
        val usersResult = User.query(parameters)
        if(usersResult.isEmpty())
            return@withPanacheSession Response.status(Response.Status.UNAUTHORIZED).build()
        val user = usersResult[0]
        user.refreshTokens = emptyList()
        user.persistAndFlush<User>().awaitSuspending()
        return@withPanacheSession Response.ok().build()
    }

    @Path("login/anonymous")
    @GET
    fun loginAnonymous(@QueryParam("tenantId") tenantId: UUID) = withPanacheSession {
        val tenant = Tenant.findById(tenantId).awaitSuspending() ?: throw NotFoundException("Tenant not found")
        val token = createAnonymousToken(tenant.id)
        return@withPanacheSession token
    }

    @Path("token/validate")
    @GET
    @Authenticated
    fun validateToken() = true

}