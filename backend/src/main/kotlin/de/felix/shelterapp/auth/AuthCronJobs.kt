package de.felix.shelterapp.auth

import io.quarkus.scheduler.Scheduled
import io.smallrye.mutiny.Uni
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class AuthCronJobs(
    private val accessTokenBlacklist: RefreshTokenBlacklist
) {
    @Scheduled(every = "1h")
    fun clearBlacklist(): Uni<Void> {
        return accessTokenBlacklist.removeExpired().replaceWithVoid()
    }
}