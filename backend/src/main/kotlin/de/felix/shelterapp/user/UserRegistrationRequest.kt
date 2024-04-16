package de.felix.shelterapp.user

import de.felix.shelterapp.user.UserRole
import jakarta.validation.constraints.Email

data class UserRegistrationRequest(
    @Email
    val email: String,
    val userRole: UserRole
)