package de.felix.shelterapp.auth

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path


@Path(("auth"))
interface AuthResource {

    @GET
    @Path("logout")
    suspend fun logout(): Boolean
    @GET
    @Path("login")
    suspend fun login(): TokenResponse
}