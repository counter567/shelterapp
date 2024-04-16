package de.felix.shelterapp.user


import io.quarkus.hibernate.reactive.panache.Panache
import io.quarkus.scheduler.Scheduled
import io.smallrye.mutiny.Uni
import jakarta.enterprise.context.ApplicationScoped
import java.time.LocalDateTime
import java.time.ZoneOffset

@ApplicationScoped
class UserCronJobs {
    @Scheduled(every="1h")
    fun cleanupRegistrations(): Uni<Void> = Panache.withSession { UserRegistration.delete("createdAt < :date", mapOf("date" to LocalDateTime.now(
        ZoneOffset.UTC).minusDays(1))).replaceWithVoid() }

    @Scheduled(every="1h")
    fun cleanupPendingEmailChanges(): Uni<Void> = Panache.withSession {
        UserEmailChange.delete("createdAt < :date", mapOf("date" to LocalDateTime.now(ZoneOffset.UTC).minusDays(1))).replaceWithVoid()
    }
}