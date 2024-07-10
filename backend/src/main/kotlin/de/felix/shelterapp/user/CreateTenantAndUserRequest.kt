package de.felix.shelterapp.user

import de.felix.shelterapp.tenant.Tenant

data class CreateTenantAndUserRequest(
    val tenant: Tenant,
    val user: User
)
