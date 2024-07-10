package de.felix.shelterapp.user

import java.util.*

data class CreateTenantAndUserResponse(
    val tenantId: UUID,
    val userId: UUID
)
