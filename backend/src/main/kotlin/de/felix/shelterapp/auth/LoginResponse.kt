package de.felix.shelterapp.auth

data class LoginResponse(
    val refreshToken: String,
    val accessToken: String
)
