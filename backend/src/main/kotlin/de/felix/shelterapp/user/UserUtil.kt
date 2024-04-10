package de.felix.shelterapp.user



fun checkIfAllowed(requestRole: UserRole, targetRole: UserRole): Boolean {
    return when(targetRole) {
        UserRole.SUPER_DUPER_ADMIN -> false
        UserRole.SUPER_ADMIN -> requestRole == UserRole.SUPER_DUPER_ADMIN
        UserRole.ADMIN -> requestRole == UserRole.SUPER_ADMIN || requestRole == UserRole.SUPER_DUPER_ADMIN
        UserRole.USER, UserRole.CARETAKER -> requestRole == UserRole.ADMIN || requestRole == UserRole.SUPER_ADMIN || requestRole == UserRole.SUPER_DUPER_ADMIN
    }
}

fun isAdmin(role: UserRole): Boolean {
    return when(role) {
        UserRole.SUPER_DUPER_ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN -> true
        else -> false
    }
}

