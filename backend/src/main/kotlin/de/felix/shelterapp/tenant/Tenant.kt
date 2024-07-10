package de.felix.shelterapp.tenant

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.felix.shelterapp.util.PagedPanacheCompanion
import io.quarkus.hibernate.reactive.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.reactive.panache.kotlin.PanacheEntityBase
import jakarta.persistence.*
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
    @Column(nullable = false)
    lateinit var name: String
    @Column(nullable = false)
    lateinit var ownerId: UUID
    @Column(nullable = false)
    lateinit var baseUrl: String
}