package de.felix.shelterapp.animal

import de.felix.shelterapp.util.PagedPanacheCompanion
import de.felix.shelterapp.util.TenantPanacheEntity
import de.felix.shelterapp.util.utcNow
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "animal", indexes = [
    Index(columnList = "name"),
    Index(columnList = "dateOfBirth"),
    Index(columnList = "dateOfAdmission"),
    Index(columnList = "type"),
    Index(columnList = "chipNumber"),
    Index(columnList = "status"),
    Index(columnList = "createdAt"),
    Index(columnList = "updatedAt")
])
class Animal: TenantPanacheEntity() {
    companion object : PagedPanacheCompanion<Animal>
    @Column(nullable = false)
    lateinit var name: String
    var dateOfBirth: LocalDate? = null
    @Column(nullable = false)
    lateinit var dateOfAdmission: LocalDate
    @Column(nullable = false)
    lateinit var type: String
    @Column(nullable = false)
    lateinit var breedOne: String
    var breedTwo: String? = null
    @Column(nullable = false)
    lateinit var sex: AnimalSex
    var color: String? = null
    @Column(columnDefinition = "TEXT")
    var mainPictureFileUrl: String? = null
    @ElementCollection(fetch = FetchType.EAGER)
    @Column(columnDefinition = "TEXT")
    var otherPictureFileUrls: List<String>? = null
    var weight: Float? = null
    var heightAtWithers: Int? = null
    var circumferenceOfNeck: Int? = null
    var lengthOfBack: Int? = null
    var circumferenceOfChest: Int? = null
    var castrated: Boolean? = null
    var bloodType: String? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var illnesses: List<String>? = null
    @ElementCollection(fetch = FetchType.EAGER)
    var allergies: List<String>? = null
    var chipNumber: String? = null
    var public: Boolean = false
    @Column(nullable = false)
    lateinit var status: AnimalStatus
    var wasFound: Boolean = false
    var successStory: Boolean = false
    var missing: Boolean = false
    var privateAdoption: Boolean = false
    @Column(columnDefinition = "TEXT")
    var notes: String? = null
    @Column(columnDefinition = "TEXT")
    var description: String? = null
    var donationCall: Boolean = false
    var internalNotes: String? = null
    var dateOfLeave: LocalDate? = null
    var dateOfDeath: LocalDate? = null
    var createdAt: LocalDateTime = utcNow()
    var updatedAt: LocalDateTime = utcNow()
    @Column(columnDefinition = "TEXT")
    var notices: String = ""
    @Column(columnDefinition = "TEXT")
    var supporters: String? = null
}

enum class AnimalSex {
    MALE, FEMALE, DIV, GROUP
}

enum class AnimalStatus {
    NEW, SEARCHING, REQUEST_STOP, EMERGENCY, RESERVED, ADOPTED, FINAL_CARE, COURT_OF_GRACE, DECEASED
}


