package de.felix.shelterapp.petevent

import io.quarkus.hibernate.reactive.panache.PanacheEntity
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import java.time.LocalDate

@Entity
class AnimalEvent: PanacheEntity() {
    var animalId: Long = 0
    var date: LocalDate? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var tags: List<String>? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var pictureFileUrls: List<String>? = null
    lateinit var title: String
    var comment: String? = null
}