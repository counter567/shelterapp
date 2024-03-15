package de.felix.shelterapp.auth

import io.smallrye.jwt.build.Jwt
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken


@Path(("auth"))
class AuthResourceImpl(
    private val jwt: JsonWebToken?
): AuthResource {

    override suspend fun logout(): Boolean {
        if(jwt != null) {
            return true
        }
        return true
    }
    @Produces(MediaType.APPLICATION_JSON)
    override suspend fun login(): TokenResponse {
        val token = Jwt.issuer("http://localhost:8080")
            .groups(setOf("USER", "ADMIN"))
            .upn("test")
            .sign()
        return TokenResponse(token)
    }
}