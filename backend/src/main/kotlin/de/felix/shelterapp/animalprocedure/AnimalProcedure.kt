package de.felix.shelterapp.animalprocedure

import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import jakarta.persistence.Entity
import jakarta.validation.constraints.NotBlank
import java.time.LocalDate
import java.util.UUID

@Entity
class AnimalProcedure : TenantPanacheEntity() {
    companion object : PagedPanacheCompanion<AnimalProcedure>
    @NotBlank
    lateinit var title: String
    lateinit var date: LocalDate
    lateinit var animalId: UUID
}