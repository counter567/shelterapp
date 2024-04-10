package de.felix.shelterapp.tenant

import de.felix.shelterapp.user.UserRole
import de.felix.shelterapp.util.*
import io.smallrye.mutiny.coroutines.awaitSuspending
import jakarta.annotation.security.RolesAllowed
import jakarta.enterprise.inject.Default
import jakarta.inject.Inject
import jakarta.persistence.Cacheable
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

@Path("/tenants")
class TenantResource {
    @Inject
    @field: Default
    lateinit var jwt: JsonWebToken
    @GET
    fun getTenants(
        @QueryParam("page") page: Int?,
        @QueryParam("pageSize") pageSize: Int?,
        @QueryParam("nameContains") nameContains: String?,
    ) = withPanacheSession {
        val params = listOf(
            PanacheQueryParameter(Tenant::name.name, nameContains, PanacheQueryParameter.Type.LIKE),
        )
        val queryParameters = PanacheQueryParameters(params, page ?: 0, pageSize ?: 20)
        return@withPanacheSession try {
            Tenant.query(queryParameters)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message)
        }
    }

    @POST
    @RolesAllowed("SUPER_DUPER_ADMIN")
    fun createTenant(@Valid tenant: Tenant) = withPanacheSession {
        tenant.persistAndFlush<Tenant>().awaitSuspending()
    }

    @PUT
    @RolesAllowed("SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun updateTenant(@Valid tenant: Tenant) = withPanacheSession {
        val userRole = jwt.getRoleOrThrow()
        val userId = jwt.getUserIdOrThrow()
        val params = mutableListOf(
            PanacheQueryParameter(Tenant::id.name, tenant.id),
        )
        if(userRole != UserRole.SUPER_DUPER_ADMIN) {
            params.add(PanacheQueryParameter(Tenant::ownerId.name, userId))
        }
        val queryParameters = PanacheQueryParameters(params)
        val existingTenant = Tenant.query(queryParameters).firstOrNull()?: if(userRole == UserRole.SUPER_DUPER_ADMIN) {
            throw NotFoundException("Tenant with id ${tenant.id} not found")
        } else {
            throw NotFoundException("Tenant with id ${tenant.id} not found or you are not the owner")
        }
        existingTenant.name = existingTenant.name
        if(userRole == UserRole.SUPER_DUPER_ADMIN) {
            existingTenant.ownerId = existingTenant.ownerId
        }
        existingTenant.ownerId = existingTenant.ownerId
        existingTenant.persistAndFlush<Tenant>().awaitSuspending()
    }

    @DELETE
    @RolesAllowed("SUPER_DUPER_ADMIN")
    fun deleteTenant(@QueryParam("id") id: UUID) = withPanacheSession {
        val tenant = Tenant.findById(id).awaitSuspending() ?: throw NotFoundException("Tenant with id $id not found")
        tenant.delete().awaitSuspending()
        tenant.flush().awaitSuspending()
    }

}