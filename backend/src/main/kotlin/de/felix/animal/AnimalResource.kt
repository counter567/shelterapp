package de.felix.animal

import io.quarkus.hibernate.reactive.rest.data.panache.PanacheEntityResource
import io.quarkus.rest.data.panache.ResourceProperties
import io.smallrye.mutiny.Uni

@ResourceProperties(path = "animals", hal = true)
interface AnimalResource: PanacheEntityResource<Animal, Long> {
    //@RolesAllowed("ADMIN")
    override fun delete(id: Long): Uni<Boolean>
}