package de.felix.shelterapp.petevent

import io.quarkus.hibernate.reactive.rest.data.panache.PanacheEntityResource
import io.quarkus.rest.data.panache.ResourceProperties

@ResourceProperties(path = "animal-events", hal = true)
interface AnimalEventResource : PanacheEntityResource<AnimalEvent, Long> {
}