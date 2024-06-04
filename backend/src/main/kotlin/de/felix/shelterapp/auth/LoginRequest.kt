package de.felix.shelterapp.auth

data class LoginRequest(
    val username: String?,
    val email: String?,
    val password: String,
    val permanent: Boolean = false
)
