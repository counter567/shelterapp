package de.felix.shelterapp.user

import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import jakarta.persistence.Entity
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Entity
class UserEmailChange : TenantPanacheEntity() {
    companion object : PagedPanacheCompanion<UserEmailChange>
    lateinit var proposedEmail: String
    var createdAt: LocalDateTime = LocalDateTime.now(ZoneOffset.UTC)
    lateinit var userId: UUID
}