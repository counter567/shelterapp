package de.felix.shelterapp.user

data class UserPasswordChangeRequest(
    val oldPassword: String,
    val newPassword: String
)
