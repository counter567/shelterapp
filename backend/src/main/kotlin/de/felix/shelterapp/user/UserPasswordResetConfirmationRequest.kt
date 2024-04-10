package de.felix.shelterapp.user

import jakarta.validation.constraints.NotBlank

data class UserPasswordResetConfirmationRequest(
    @NotBlank
    val newPassword: String
)
