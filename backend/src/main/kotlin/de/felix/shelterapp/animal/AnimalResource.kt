package de.felix.shelterapp.animal

import io.quarkus.hibernate.reactive.rest.data.panache.PanacheEntityResource
import io.quarkus.rest.data.panache.ResourceProperties
import io.smallrye.mutiny.Uni
import jakarta.annotation.security.RolesAllowed

@ResourceProperties(path = "animals", hal = true)
interface AnimalResource: PanacheEntityResource<Animal, Long> {
    @RolesAllowed("ADMIN")
    override fun add(entity: Animal?): Uni<Animal>
}