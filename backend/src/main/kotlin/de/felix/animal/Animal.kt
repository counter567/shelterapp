package de.felix.animal

import io.quarkus.hibernate.reactive.panache.PanacheEntity
import jakarta.persistence.ElementCollection
import jakarta.persistence.Embeddable
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import java.time.LocalDate

@Entity
class Animal: PanacheEntity() {
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

@Entity
class PetEvent: PanacheEntity() {
    var animalId: Long = 0
    var date: LocalDate? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var tags: List<String>? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var pictureFileUrls: List<String>? = null
    lateinit var title: String
    var comment: String? = null
}