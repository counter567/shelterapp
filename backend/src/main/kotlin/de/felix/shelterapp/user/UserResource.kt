package de.felix.shelterapp.user

import at.favre.lib.crypto.bcrypt.BCrypt
import de.felix.shelterapp.user.User
import de.felix.shelterapp.user.UserRole
import de.felix.shelterapp.auth.RefreshTokenBlacklist
import de.felix.shelterapp.general.EmailService
import de.felix.shelterapp.tenant.Tenant
import de.felix.shelterapp.util.*
import io.quarkus.security.Authenticated
import io.smallrye.mutiny.coroutines.awaitSuspending
import jakarta.annotation.security.RolesAllowed
import jakarta.enterprise.inject.Default
import jakarta.inject.Inject
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotEmpty
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.config.inject.ConfigProperty
import org.eclipse.microprofile.jwt.JsonWebToken
import org.hibernate.exception.ConstraintViolationException
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Path("/users")
class UserResource {
    @Inject
    @field: Default
    lateinit var jwt: JsonWebToken
    @Inject
    @field: Default
    lateinit var emailService: EmailService
    @field: ConfigProperty(name = "ortify.baseUrl")
    lateinit var baseUrl: String
    @Inject
    @field: Default
    lateinit var tokenBlackList: RefreshTokenBlacklist
    @POST
    @RolesAllowed("SUPER_DUPER_ADMIN", "SUPER_ADMIN", "ADMIN")
    fun createUser(
        @Valid user: User
    ) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val requestRole = jwt.getRoleOrThrow()
        user.tenantId = tenantId
        user.password = BCrypt.withDefaults().hashToString(12, user.password.toCharArray())
        user.createdAt = LocalDateTime.now(ZoneOffset.UTC)
        user.refreshTokens = emptyList()
        if(!checkIfAllowed(requestRole, user.role)) {
            throw BadRequestException()
        }
        try {
            return@withPanacheSession user.persistAndFlush<User>().awaitSuspending()
        }catch (e: ConstraintViolationException) {
            throw BadRequestException("Username or email already exists")
        }

    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("SUPER_DUPER_ADMIN", "SUPER_ADMIN", "ADMIN")
    fun getUsers(
        @QueryParam("page") page: Int?,
        @QueryParam("pageSize") pageSize: Int?,
        @QueryParam("usernameContains") usernameContains: String?,
        @QueryParam("emailContains") emailContains: String?,
        @QueryParam("createdBefore") createdBefore: LocalDateTime?,
        @QueryParam("createdAfter") createdAfter: LocalDateTime?,
        @QueryParam("roleIs") roleIs: UserRole?,
        @QueryParam("lastLoginBefore") lastLoginBefore: LocalDateTime?,
        @QueryParam("lastLoginAfter") lastLoginAfter: LocalDateTime?,
        @QueryParam("fistNameContains") firstNameContains: String?,
        @QueryParam("lastNameContains") lastNameContains: String?,
        @QueryParam("idIs") idIs: UUID?
    ) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(User::username.name, usernameContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(User::email.name, emailContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(User::tenantId.name, tenantId),
            PanacheQueryParameter(User::id.name, idIs),
            PanacheQueryParameter(User::role.name, roleIs),
            PanacheQueryParameter(User::createdAt.name, createdBefore, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(User::createdAt.name, createdAfter, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(User::lastLogin.name, lastLoginBefore, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(User::lastLogin.name, lastLoginAfter, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(User::firstName.name, firstNameContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(User::lastName.name, lastNameContains, PanacheQueryParameter.Type.LIKE),
        )
        val queryParameters = PanacheQueryParameters(params, page ?: 0, pageSize ?: 20)
        return@withPanacheSession try {
            User.query(queryParameters)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message)
        }
    }

    @PUT
    @RolesAllowed("SUPER_DUPER_ADMIN", "SUPER_ADMIN", "ADMIN")
    fun updateUser(
        @Valid user: User,
        @QueryParam("updatePassword") updatePassword: Boolean = false,
    ) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val requestRole = jwt.getRoleOrThrow()
        if(!checkIfAllowed(requestRole, user.role)) {
            if(!(user.username == jwt.getUsername() && user.role == requestRole)) {
                //User needs to be able to update themselves with the same role
                throw BadRequestException()
            }
        }
        val params = listOf(
            PanacheQueryParameter(User::username.name, user.username),
            PanacheQueryParameter(User::tenantId.name, tenantId),
        )
        val queryParameters = PanacheQueryParameters(params)
        val existingUser = User.query(queryParameters).firstOrNull() ?: throw NotFoundException("User not found")
        if(updatePassword && user.password.isNotBlank()) {
            existingUser.password = BCrypt.withDefaults().hashToString(12, user.password.toCharArray())
        }
        existingUser.role = user.role
        existingUser.email = user.email
        existingUser.refreshTokens.forEach {
            tokenBlackList.add(it.id, existingUser.id)
        }
        existingUser.persistAndFlush<User>().awaitSuspending()
    }

    @DELETE
    @RolesAllowed("SUPER_DUPER_ADMIN", "SUPER_ADMIN", "ADMIN")
    fun deleteUser(@QueryParam("id") id: UUID) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(User::id.name, id),
            PanacheQueryParameter(User::tenantId.name, tenantId),
        )
        val queryParameters = PanacheQueryParameters(params)
        val user = User.query(queryParameters).firstOrNull() ?: throw NotFoundException("User not found")
        if(!checkIfAllowed(jwt.getRoleOrThrow(), user.role)) {
            throw BadRequestException()
        }
        user.refreshTokens.forEach {
            tokenBlackList.add(it.id, user.id)
        }
        User.deleteById(id).awaitSuspending()

        return@withPanacheSession Response.ok().build()
    }

    @GET
    @Path("/usernameTaken")
    fun isUsernameTaken(@QueryParam("username")@NotEmpty username: String, @QueryParam("tenantId") tenantId: UUID) = withPanacheSession {
        val params = listOf(
            PanacheQueryParameter(User::username.name, username),
            PanacheQueryParameter(User::tenantId.name, tenantId),
        )
        val queryParameters = PanacheCountParameters(params)
        return@withPanacheSession User.count(queryParameters) > 0
    }

    @GET
    @Path("/emailTaken")
    fun isEmailTaken(@QueryParam("email")@Email email: String,@QueryParam("tenantId") tenantId: UUID) = withPanacheSession {
        return@withPanacheSession emailTaken(email, tenantId)
    }

    @POST
    @Path("/register")
    @RolesAllowed("SUPER_DUPER_ADMIN", "SUPER_ADMIN", "ADMIN")
    fun register(@Valid request: UserRegistrationRequest) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        if(!checkIfAllowed(jwt.getRoleOrThrow(), request.userRole)) {
            throw BadRequestException()
        }
        if(emailTaken(request.email, tenantId)) {
            throw BadRequestException("Email already taken")
        }
        val params = listOf(
            PanacheQueryParameter(UserRegistration::email.name, request.email),
            PanacheQueryParameter(UserRegistration::tenantId.name, tenantId),
        )
        val queryParameters = PanacheCountParameters(params)
        if(UserRegistration.count(queryParameters) > 0) {
            throw BadRequestException("Registration already exists")
        }
        val tenant = Tenant.findById(tenantId).awaitSuspending() ?: throw NotFoundException("Tenant not found")
        val email = UserRegistrationEmail(
            email = request.email,
            tenantName = tenant.name,
            role = request.userRole
        )
        if(!emailService.sendEmail(email)) {
            throw InternalServerErrorException("Could not send email")
        }
        val registration = UserRegistration()
        registration.email = request.email
        registration.tenantId = tenantId
        registration.persistAndFlush<UserRegistration>().awaitSuspending()
        return@withPanacheSession
    }

    @POST
    @Path("/register/{id}")
    fun finishRegistration(@Valid request: UserFinishRegistrationRequest, @PathParam("id") id: UUID) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(UserRegistration::id.name, id),
            PanacheQueryParameter(UserRegistration::tenantId.name, tenantId),
        )
        val queryParameters = PanacheQueryParameters(params)
        val registration = UserRegistration.query(queryParameters).firstOrNull() ?: throw NotFoundException("Registration not found")
        val user = User()
        user.username = request.username
        user.email = registration.email
        user.password = BCrypt.withDefaults().hashToString(12, request.password.toCharArray())
        user.createdAt = LocalDateTime.now(ZoneOffset.UTC)
        user.refreshTokens = emptyList()
        user.tenantId = tenantId
        user.persistAndFlush<User>().awaitSuspending()
        registration.delete().awaitSuspending()
    }

    @POST
    @Path("/email/change")
    @Authenticated
    fun changeEmail(@Valid request: UserEmailChangeRequest) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        if(emailTaken(request.email, tenantId)) {
            throw BadRequestException("Email already taken")
        }
        val user = User.findById(jwt.getUserIdOrThrow()).awaitSuspending() ?: throw NotFoundException("User not found")
        if(!BCrypt.verifyer().verify(request.password.toCharArray(), user.password).verified) {
            throw BadRequestException()
        }
        val emailChange = UserEmailChange()
        emailChange.proposedEmail = request.email
        emailChange.userId = user.id
        emailChange.tenantId = tenantId
        val persistedEmailChange = emailChange.persistAndFlush<UserEmailChange>().awaitSuspending()
        val emailChallenge = UserEmailChangeChallengeEmail(
            newEmail = request.email,
            token = persistedEmailChange.id,
            baseUrl = baseUrl
        )
        if(!emailService.sendEmail(emailChallenge)) {
            throw InternalServerErrorException("Could not send email")
        }
    }

    @POST
    @Path("/password/change")
    @Authenticated
    fun changePassword(@Valid request: UserPasswordChangeRequest) = withPanacheSession {
        val user = User.findById(jwt.getUserIdOrThrow()).awaitSuspending() ?: throw NotFoundException("User not found")
        if(!BCrypt.verifyer().verify(request.oldPassword.toCharArray(), user.password).verified) {
            throw BadRequestException()
        }
        user.password = BCrypt.withDefaults().hashToString(12, request.newPassword.toCharArray())
        user.persistAndFlush<User>().awaitSuspending()
        return@withPanacheSession
    }
    @GET
    @Path("/email/change/confirm")
    @Authenticated
    fun confirmEmailChange(@QueryParam("token") token: UUID) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(UserEmailChange::id.name, token),
            PanacheQueryParameter(UserEmailChange::tenantId.name, tenantId),
        )
        val queryParameters = PanacheQueryParameters(params)
        val emailChange = UserEmailChange.query(queryParameters).firstOrNull() ?: throw NotFoundException("Email change not found")
        val user = User.findById(emailChange.userId).awaitSuspending() ?: throw NotFoundException("User not found")
        user.email = emailChange.proposedEmail
        user.persistAndFlush<User>().awaitSuspending()
        emailChange.delete().awaitSuspending()
        emailChange.flush().awaitSuspending()
        val emailChanged = UserEmailChangedEmail(user.email)
        if(!emailService.sendEmail(emailChanged)) {
            throw InternalServerErrorException("Could not send email")
        }
    }

    @GET
    @Path("/password/reset")
    fun resetPassword(@QueryParam("email") email: String?, @QueryParam("username") username: String?) = withPanacheSession {
        if(email == null && username == null) {
            throw BadRequestException("Email or username must be provided")
        }
        val params = mutableListOf(
            PanacheQueryParameter(User::email.name, email),
            PanacheQueryParameter(User::username.name, username),
        )
        val queryParameters = PanacheQueryParameters(params)
        val users = User.query(queryParameters)
        if(users.isEmpty()) {
            throw BadRequestException()
        }
        val user = users.first()
        var reset = PendingUserPasswordReset()
        reset.userId = user.id
        reset.tenantId = user.tenantId
        reset = reset.persistAndFlush<PendingUserPasswordReset>().awaitSuspending()
        val resetUrl = "$baseUrl/password/reset/${reset.id}"
        val resetEmail = PasswordResetEmail(resetUrl, user.email)
        if(!emailService.sendEmail(resetEmail)) {
            throw InternalServerErrorException("Could not send email")
        }

        return@withPanacheSession
    }

    @POST
    @Path("/password/reset/{id}")
    fun confirmPasswordReset(@Valid request: UserPasswordResetConfirmationRequest, @PathParam("id") id: UUID) = withPanacheSession {
        val reset = PendingUserPasswordReset.findById(id).awaitSuspending() ?: throw BadRequestException()
        val user = User.findById(reset.userId).awaitSuspending() ?: throw BadRequestException()
        user.password = BCrypt.withDefaults().hashToString(12, request.newPassword.toCharArray())
        user.refreshTokens.forEach {
            tokenBlackList.add(it.id, user.id)
        }
        user.refreshTokens = emptyList()
        user.persistAndFlush<User>().awaitSuspending()
        reset.delete().awaitSuspending()
        reset.flush().awaitSuspending()

        return@withPanacheSession
    }

    private suspend fun emailTaken(email: String, tenantId: UUID): Boolean {
        val params = mutableListOf(
            PanacheQueryParameter(User::email.name, email),
            PanacheQueryParameter(User::tenantId.name, tenantId),
        )
        val queryParameters = PanacheCountParameters(params)
        return User.count(queryParameters) > 0
    }
}