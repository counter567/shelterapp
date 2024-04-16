package de.felix.shelterapp.user

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotEmpty

data class UserEmailChangeRequest(
    @Email
    val email: String,
    @NotEmpty
    val password: String
)
