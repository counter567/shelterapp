package de.felix.shelterapp.auth

import de.felix.shelterapp.util.*
import io.quarkus.hibernate.reactive.panache.Panache
import io.smallrye.mutiny.Uni
import io.smallrye.mutiny.coroutines.awaitSuspending
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.Entity
import org.eclipse.microprofile.jwt.JsonWebToken
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.util.*

@ApplicationScoped
class RefreshTokenBlacklist {
    private val blacklist = mutableSetOf<TokenBlacklistEntry>()
    private var initialized = false

    suspend fun check(token: JsonWebToken): Boolean {
        if(!initialized) {
            withPanacheSession {
                blacklist.addAll(TokenBlacklistEntry.listAll().awaitSuspending())
                initialized = true
            }.awaitSuspending()
        }
        val createdAt = LocalDateTime.ofInstant(Instant.ofEpochSecond(token.issuedAtTime), ZoneOffset.UTC)

        return blacklist.none { it.refreshTokenId == token.getRefreshTokenIdOrThrow() && createdAt.isBefore(it.tokenCreatedAt) }
    }


    suspend fun add(id: UUID, userId: UUID, createdAt: LocalDateTime = LocalDateTime.now(ZoneId.of("UTC"))) {
        val entry = TokenBlacklistEntry()
        entry.refreshTokenId = id
        entry.expiresAt = LocalDateTime.now(ZoneOffset.UTC).plusHours(1)
        entry.userId = userId
        entry.tokenCreatedAt = createdAt
        val persistedEntry = entry.persistAndFlush<TokenBlacklistEntry>().awaitSuspending()
        blacklist.add(persistedEntry)
    }
    fun removeExpired(): Uni<Long> = Panache.withSession {
        blacklist.removeIf { it.expiresAt.isBefore(LocalDateTime.now(ZoneOffset.UTC)) }
        return@withSession TokenBlacklistEntry.delete("expiresAt < :date", mapOf("date" to LocalDateTime.now(ZoneOffset.UTC)))
    }
}
@Entity
class TokenBlacklistEntry: TenantPanacheEntity() {
    companion object : PagedPanacheCompanion<TokenBlacklistEntry>
    lateinit var refreshTokenId: UUID
    lateinit var userId: UUID
    lateinit var tokenCreatedAt: LocalDateTime
    lateinit var expiresAt: LocalDateTime
}
