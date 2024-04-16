package de.felix.shelterapp.user

import de.felix.shelterapp.user.UserRole
import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import jakarta.persistence.*
import java.time.LocalDateTime
import java.time.ZoneOffset

@Entity
@Table(indexes = [Index(columnList = "email")])
class UserRegistration: TenantPanacheEntity() {
    companion object: PagedPanacheCompanion<UserRegistration>
    lateinit var email: String
    var role: UserRole = UserRole.USER
    var createdAt: LocalDateTime = LocalDateTime.now(ZoneOffset.UTC)
}