package de.felix.shelterapp.tenant

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.felix.shelterapp.util.PagedPanacheCompanion
import io.quarkus.hibernate.reactive.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.reactive.panache.kotlin.PanacheEntityBase
import jakarta.persistence.Cacheable
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import org.hibernate.annotations.GenericGenerator
import java.util.*

@Entity
@Cacheable
class Tenant: PanacheEntityBase {
    companion object : PagedPanacheCompanion<Tenant>
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @set: JsonIgnore
    @get: JsonProperty
    lateinit var id: UUID
    lateinit var name: String
    lateinit var ownerId: UUID
}