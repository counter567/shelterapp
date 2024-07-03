package de.felix.shelterapp.user

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import de.felix.shelterapp.util.utcNow
import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotEmpty
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "`user`", indexes = [Index(columnList = "username"), Index(columnList = "email"), Index(columnList = "firstName"), Index(columnList = "lastName")])
class User: TenantPanacheEntity() {
    companion object: PagedPanacheCompanion<User>

    @Column(unique = true, nullable = false)
    @NotEmpty
    lateinit var username: String
    @Column(unique = true, nullable = false)
    @Email
    lateinit var email: String
    @NotEmpty
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    lateinit var password: String
    @set: JsonIgnore
    @get: JsonProperty
    var createdAt: LocalDateTime = utcNow()
    @set: JsonIgnore
    @get: JsonProperty
    var lastLogin: LocalDateTime? = null
    var firstName: String? = null
    var lastName: String? = null
    var role: UserRole = UserRole.USER
    @ElementCollection(fetch = FetchType.EAGER)
    @JsonIgnore
    lateinit var refreshTokens: List<UserRefreshToken>
}

enum class UserRole {
    USER, CARETAKER, ADMIN, SUPER_ADMIN, SUPER_DUPER_ADMIN
}
@Embeddable
class UserRefreshToken {
    @Column(nullable = false)
    lateinit var id: UUID
    @Column(nullable = false)
    lateinit var expirationDate: LocalDateTime
}

fun Iterable<UserRefreshToken>.containsToken(id: UUID) = this.any { it.id == id }
