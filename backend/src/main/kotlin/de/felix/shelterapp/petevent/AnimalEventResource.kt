package de.felix.shelterapp.petevent

import de.felix.shelterapp.util.PanacheQueryParameter
import de.felix.shelterapp.util.PanacheQueryParameters
import de.felix.shelterapp.util.getTenantIdOrThrow
import de.felix.shelterapp.util.withPanacheSession
import io.quarkus.security.Authenticated
import io.smallrye.mutiny.coroutines.awaitSuspending
import jakarta.annotation.security.RolesAllowed
import jakarta.enterprise.inject.Default
import jakarta.inject.Inject
import jakarta.validation.Valid
import jakarta.ws.rs.BadRequestException
import jakarta.ws.rs.DELETE
import jakarta.ws.rs.GET
import jakarta.ws.rs.NotFoundException
import jakarta.ws.rs.POST
import jakarta.ws.rs.PUT
import jakarta.ws.rs.Path
import jakarta.ws.rs.QueryParam
import org.eclipse.microprofile.jwt.JsonWebToken
import java.util.*

@Path("animal-events")
class AnimalEventResource {
    @Inject
    @field: Default
    lateinit var jwt: JsonWebToken

    @GET
    @Authenticated
    fun getAnimalEventsForAnimal(
        @QueryParam("id") animalId: UUID,
        @QueryParam("page") page: Int?,
        @QueryParam("pageSize") pageSize: Int?
    ) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(AnimalEvent::tenantId.name, tenantId),
            PanacheQueryParameter(AnimalEvent::animalId.name, animalId)
        )
        val queryParameters = PanacheQueryParameters(params, page ?: 0, pageSize ?: 20)
        return@withPanacheSession try {
            AnimalEvent.query(queryParameters)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message)
        }
    }

    @POST
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun createAnimalEvent(@Valid animalEvent: AnimalEvent) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        animalEvent.tenantId = tenantId
        animalEvent.persistAndFlush<AnimalEvent>().awaitSuspending()
    }

    @PUT
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun updateAnimalEvent(@Valid animalEvent: AnimalEvent) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(AnimalEvent::tenantId.name, tenantId),
            PanacheQueryParameter(AnimalEvent::id.name, animalEvent.id)
        )
        val queryParameters = PanacheQueryParameters(params)
        val existingEvent = AnimalEvent.query(queryParameters).firstOrNull() ?: throw NotFoundException("Event not found")
        existingEvent.tags = animalEvent.tags
        existingEvent.date = animalEvent.date
        existingEvent.comment = animalEvent.comment
        existingEvent.title = animalEvent.title
        existingEvent.pictureFileUrls = animalEvent.pictureFileUrls
        existingEvent.persistAndFlush<AnimalEvent>().awaitSuspending()
    }

    @DELETE
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun deleteAnimalEvent(@QueryParam("id") id: UUID) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(AnimalEvent::tenantId.name, tenantId),
            PanacheQueryParameter(AnimalEvent::id.name, id)
        )
        val queryParameters = PanacheQueryParameters(params)
        val existingEvent = AnimalEvent.query(queryParameters).firstOrNull() ?: throw NotFoundException("Event not found")
        existingEvent.delete().awaitSuspending()
    }
}