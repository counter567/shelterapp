package de.felix.shelterapp.animal

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
import java.time.LocalDate
import java.util.*


@Path("animals")
class AnimalResource {
    @Inject
    @field: Default
    lateinit var jwt: JsonWebToken


    @GET
    @Authenticated
    fun getAnimals(
        @QueryParam("page") page: Int?,
        @QueryParam("pageSize") pageSize: Int?,
        @QueryParam("nameContains") nameContains: String?,
        @QueryParam("typeContains") typeContains: String?,
        @QueryParam("status") status: AnimalStatus?,
        @QueryParam("isPublic") isPublic: Boolean?,
        @QueryParam("isSuccessStory") isSuccessStory: Boolean?,
        @QueryParam("isMissing") isMissing: Boolean?,
        @QueryParam("isPrivateAdoption") isPrivateAdoption: Boolean?,
        @QueryParam("wasFound") wasFound: Boolean?,
        @QueryParam("isCastrated") isCastrated: Boolean?,
        @QueryParam("id") id: UUID?,
        @QueryParam("chipNumberContains") chipNumberContains: String?,
        @QueryParam("breedOneContains") breedOneContains: String?,
        @QueryParam("breedTwoContains") breedTwoContains: String?,
        @QueryParam("dateOfBirthBefore") dateOfBirthBefore: LocalDate?,
        @QueryParam("dateOfBirthAfter") dateOfBirthAfter: LocalDate?,
        @QueryParam("dateOfAdmissionBefore") dateOfAdmissionBefore: LocalDate?,
        @QueryParam("dateOfAdmissionAfter") dateOfAdmissionAfter: LocalDate?,
        @QueryParam("sex") sex: AnimalSex?,
        @QueryParam("colorContains") colorContains: String?,
        @QueryParam("weightAbove") weightAbove: Float?,
        @QueryParam("weightBelow") weightBelow: Float?,
        @QueryParam("heightAtWithersAbove") heightAtWithersAbove: Int?,
        @QueryParam("heightAtWithersBelow") heightAtWithersBelow: Int?,
        @QueryParam("circumferenceOfNeckAbove") circumferenceOfNeckAbove: Int?,
        @QueryParam("circumferenceOfNeckBelow") circumferenceOfNeckBelow: Int?,
        @QueryParam("lengthOfBackAbove") lengthOfBackAbove: Int?,
        @QueryParam("lengthOfBackBelow") lengthOfBackBelow: Int?,
        @QueryParam("circumferenceOfChestAbove") circumferenceOfChestAbove: Int?,
        @QueryParam("circumferenceOfChestBelow") circumferenceOfChestBelow: Int?,
        @QueryParam("bloodTypeContains") bloodTypeContains: String?,
        @QueryParam("hasDonationCall") hasDonationCall: Boolean?,
        @QueryParam("dateOfLeaveBefore") dateOfLeaveBefore: LocalDate?,
        @QueryParam("dateOfLeaveAfter") dateOfLeaveAfter: LocalDate?,
        @QueryParam("dateOfDeathBefore") dateOfDeathBefore: LocalDate?,
        @QueryParam("dateOfDeathAfter") dateOfDeathAfter: LocalDate?,
    ) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(Animal::tenantId.name, tenantId),
            PanacheQueryParameter(Animal::name.name, nameContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(Animal::type.name, typeContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(Animal::status.name, status),
            PanacheQueryParameter(Animal::isPublic.name, isPublic),
            PanacheQueryParameter(Animal::isSuccessStory.name, isSuccessStory),
            PanacheQueryParameter(Animal::isMissing.name, isMissing),
            PanacheQueryParameter(Animal::isPrivateAdoption.name, isPrivateAdoption),
            PanacheQueryParameter(Animal::wasFound.name, wasFound),
            PanacheQueryParameter(Animal::isCastrated.name, isCastrated),
            PanacheQueryParameter(Animal::id.name, id),
            PanacheQueryParameter(Animal::chipNumber.name, chipNumberContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(Animal::breedOne.name, breedOneContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(Animal::breedTwo.name, breedTwoContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(Animal::dateOfBirth.name, dateOfBirthBefore, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::dateOfBirth.name, dateOfBirthAfter, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(Animal::dateOfAdmission.name, dateOfAdmissionBefore, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::dateOfAdmission.name, dateOfAdmissionAfter, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(Animal::sex.name, sex),
            PanacheQueryParameter(Animal::color.name, colorContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(Animal::weight.name, weightAbove, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(Animal::weight.name, weightBelow, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::heightAtWithers.name, heightAtWithersAbove, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(Animal::heightAtWithers.name, heightAtWithersBelow, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::circumferenceOfNeck.name, circumferenceOfNeckAbove, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(Animal::circumferenceOfNeck.name, circumferenceOfNeckBelow, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::lengthOfBack.name, lengthOfBackAbove, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(Animal::lengthOfBack.name, lengthOfBackBelow, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::circumferenceOfChest.name, circumferenceOfChestAbove, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(Animal::circumferenceOfChest.name, circumferenceOfChestBelow, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::bloodType.name, bloodTypeContains, PanacheQueryParameter.Type.LIKE),
            PanacheQueryParameter(Animal::donationCall.name, hasDonationCall),
            PanacheQueryParameter(Animal::dateOfLeave.name, dateOfLeaveBefore, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::dateOfLeave.name, dateOfLeaveAfter, PanacheQueryParameter.Type.GREATER_THAN),
            PanacheQueryParameter(Animal::dateOfDeath.name, dateOfDeathBefore, PanacheQueryParameter.Type.LESS_THAN),
            PanacheQueryParameter(Animal::dateOfDeath.name, dateOfDeathAfter, PanacheQueryParameter.Type.GREATER_THAN),
        )
        val queryParameters = PanacheQueryParameters(params, page ?: 0, pageSize ?: 20)
        return@withPanacheSession try {
            Animal.query(queryParameters)
        } catch (e: IllegalArgumentException) {
            throw BadRequestException(e.message)
        }
    }

    @POST
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun createAnimal(@Valid animal: Animal) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        animal.tenantId = tenantId
        animal.persistAndFlush<Animal>().awaitSuspending()
    }

    @PUT
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun updateAnimal(@Valid animal: Animal) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(Animal::tenantId.name, tenantId),
            PanacheQueryParameter(Animal::id.name, animal.id),
        )
        val queryParameters = PanacheQueryParameters(params)
        val dbAnimal = Animal.query(queryParameters).firstOrNull() ?: throw NotFoundException("Animal not found")
        dbAnimal.name = animal.name
        dbAnimal.sex = animal.sex
        dbAnimal.type = animal.type
        dbAnimal.status = animal.status
        dbAnimal.isPublic = animal.isPublic
        dbAnimal.isSuccessStory = animal.isSuccessStory
        dbAnimal.isMissing = animal.isMissing
        dbAnimal.isPrivateAdoption = animal.isPrivateAdoption
        dbAnimal.wasFound = animal.wasFound
        dbAnimal.isCastrated = animal.isCastrated
        dbAnimal.chipNumber = animal.chipNumber
        dbAnimal.breedOne = animal.breedOne
        dbAnimal.breedTwo = animal.breedTwo
        dbAnimal.dateOfBirth = animal.dateOfBirth
        dbAnimal.dateOfAdmission = animal.dateOfAdmission
        dbAnimal.color = animal.color
        dbAnimal.mainPictureFileUrl = animal.mainPictureFileUrl
        dbAnimal.otherPictureFileUrls = animal.otherPictureFileUrls
        dbAnimal.weight = animal.weight
        dbAnimal.heightAtWithers = animal.heightAtWithers
        dbAnimal.circumferenceOfNeck = animal.circumferenceOfNeck
        dbAnimal.lengthOfBack = animal.lengthOfBack
        dbAnimal.circumferenceOfChest = animal.circumferenceOfChest
        dbAnimal.bloodType = animal.bloodType
        dbAnimal.illnesses = animal.illnesses
        dbAnimal.allergies = animal.allergies
        dbAnimal.procedures = animal.procedures
        dbAnimal.notes = animal.notes
        dbAnimal.description = animal.description
        dbAnimal.donationCall = animal.donationCall
        dbAnimal.internalNotes = animal.internalNotes
        dbAnimal.dateOfLeave = animal.dateOfLeave
        dbAnimal.dateOfDeath = animal.dateOfDeath
        dbAnimal.persistAndFlush<Animal>().awaitSuspending()
    }

    @DELETE
    @RolesAllowed("CARETAKER", "ADMIN", "SUPER_ADMIN", "SUPER_DUPER_ADMIN")
    fun deleteAnimal(@QueryParam("id") id: UUID) = withPanacheSession {
        val tenantId = jwt.getTenantIdOrThrow()
        val params = listOf(
            PanacheQueryParameter(Animal::tenantId.name, tenantId),
            PanacheQueryParameter(Animal::id.name, id),
        )
        val queryParameters = PanacheQueryParameters(params)
        val dbAnimal = Animal.query(queryParameters).firstOrNull() ?: throw NotFoundException("Animal not found")
        dbAnimal.delete().awaitSuspending()
        dbAnimal.flush().awaitSuspending()
    }

}