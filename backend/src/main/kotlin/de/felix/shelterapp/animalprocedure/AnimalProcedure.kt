package de.felix.shelterapp.animalprocedure

import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.validation.constraints.NotBlank
import java.time.LocalDate
import java.util.UUID

@Entity
class AnimalProcedure : TenantPanacheEntity() {
    companion object : PagedPanacheCompanion<AnimalProcedure>
    @NotBlank
    lateinit var title: String
    @Column(nullable = false)
    lateinit var date: LocalDate
    @Column(nullable = false)
    lateinit var animalId: UUID
}