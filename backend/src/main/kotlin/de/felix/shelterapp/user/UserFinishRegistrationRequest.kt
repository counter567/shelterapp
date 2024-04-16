package de.felix.shelterapp.user

data class UserFinishRegistrationRequest(
    val password: String,
    val username: String
)