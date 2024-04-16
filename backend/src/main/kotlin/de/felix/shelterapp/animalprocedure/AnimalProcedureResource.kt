package de.felix.shelterapp.animalprocedure

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
import jakarta.ws.rs.*
import org.eclipse.microprofile.jwt.JsonWebToken
import java.util.UUID

@Path("/animal-procedures")
class AnimalProcedureResource {
    @Inject
    @field: Default
    lateinit var jwt : JsonWebToken

    @GET
    @Authenticated
    fun getAnimalProceduresForAnimal(
        @QueryParam("page") page: Int?,
        @QueryParam("pageSize") pageSize: Int?,
        @QueryParam("animalId") animalId: UUID
    ) = withPanacheSession{
        val tenantId  = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(AnimalProcedure::animalId.name, animalId),
            PanacheQueryParameter(AnimalProcedure::tenantId.name, tenantId)
        )
        val queryParameters = PanacheQueryParameters(params, page ?: 0, pageSize ?: 20)
        return@withPanacheSession try {
            AnimalProcedure.query(queryParameters)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message)
        }
    }

    @POST
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun createAnimalProcedure(@Valid animalProcedure: AnimalProcedure) = withPanacheSession {
        animalProcedure.tenantId = jwt.getTenantIdOrThrow()
        animalProcedure.persistAndFlush<AnimalProcedure>().awaitSuspending()
    }

    @PUT
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun updateAnimalProcedure(@Valid animalProcedure: AnimalProcedure) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        animalProcedure.tenantId = tenantId
        val params = listOf(
            PanacheQueryParameter(AnimalProcedure::id.name, animalProcedure.id),
            PanacheQueryParameter(AnimalProcedure::tenantId.name, tenantId)
        )
        val queryParameters = PanacheQueryParameters(params)
        val existingProcedure = AnimalProcedure.query(queryParameters).firstOrNull() ?: throw NotFoundException()
        existingProcedure.title = animalProcedure.title
        existingProcedure.date = animalProcedure.date
        existingProcedure.persistAndFlush<AnimalProcedure>().awaitSuspending()
    }

    @DELETE
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun deleteAnimalProcedure(@QueryParam("id") id: UUID) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(AnimalProcedure::id.name, id),
            PanacheQueryParameter(AnimalProcedure::tenantId.name, tenantId)
        )
        val queryParameters = PanacheQueryParameters(params)
        val existingProcedure = AnimalProcedure.query(queryParameters).firstOrNull() ?: throw NotFoundException()
        existingProcedure.delete().awaitSuspending()
    }
}