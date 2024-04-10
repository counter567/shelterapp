package de.felix.shelterapp.petevent

import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import java.time.LocalDate
import java.util.*

@Entity
class AnimalEvent: TenantPanacheEntity() {
    companion object : PagedPanacheCompanion<AnimalEvent>
    lateinit var animalId: UUID
    var date: LocalDate? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var tags: List<String>? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var pictureFileUrls: List<String>? = null
    lateinit var title: String
    var comment: String? = null
}