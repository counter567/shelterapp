package de.felix.shelterapp.animal

import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import io.quarkus.hibernate.reactive.panache.PanacheEntity
import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import java.time.LocalDate

@Entity
@Table(name = "animal", indexes = [
    Index(columnList = "name"),
    Index(columnList = "dateOfBirth"),
    Index(columnList = "dateOfAdmission"),
    Index(columnList = "type"),
    Index(columnList = "chipNumber"),
    Index(columnList = "status"),

])
class Animal: TenantPanacheEntity() {
    companion object : PagedPanacheCompanion<Animal>
    lateinit var name: String
    var dateOfBirth: LocalDate? = null
    lateinit var dateOfAdmission: LocalDate
    lateinit var type: String
    lateinit var breedOne: String
    var breedTwo: String? = null
    lateinit var sex: AnimalSex
    var color: String? = null
    var mainPictureFileUrl: String? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var otherPictureFileUrls: List<String>? = null
    var weight: Float? = null
    var heightAtWithers: Int? = null
    var circumferenceOfNeck: Int? = null
    var lengthOfBack: Int? = null
    var circumferenceOfChest: Int? = null
    var isCastrated: Boolean? = null
    var bloodType: String? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var illnesses: List<String>? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var allergies: List<String>? = null
    @ElementCollection(targetClass = AnimalProcedure::class, fetch = FetchType.EAGER)
    var procedures: List<AnimalProcedure>? = null
    var chipNumber: String? = null
    var isPublic: Boolean = false
    lateinit var status: AnimalStatus
    var wasFound: Boolean? = null
    var isSuccessStory: Boolean = false
    var isMissing: Boolean = false
    var isPrivateAdoption: Boolean = false
    var notes: String? = null
    var description: String? = null
    var donationCall: Boolean = false
    var internalNotes: String? = null
    var dateOfLeave: LocalDate? = null
    var dateOfDeath: LocalDate? = null
}

enum class AnimalSex {
    MALE, FEMALE
}

enum class AnimalStatus {
    NEW, SEARCHING, REQUEST_STOP, EMERGENCY, RESERVED, ADOPTED, FINAL_CARE, COURT_OF_GRACE, DECEASED
}

@Embeddable
class AnimalProcedure {
    lateinit var title: String
    lateinit var date: LocalDate
}

