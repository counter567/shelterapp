package de.felix.shelterapp.user

import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import jakarta.persistence.Entity
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.UUID

@Entity
class PendingUserPasswordReset: TenantPanacheEntity() {
    companion object : PagedPanacheCompanion<PendingUserPasswordReset>
    lateinit var userId: UUID
    var createdAt: LocalDateTime = LocalDateTime.now(ZoneOffset.UTC)
}