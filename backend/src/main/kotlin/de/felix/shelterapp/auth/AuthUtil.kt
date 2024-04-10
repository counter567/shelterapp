package de.felix.shelterapp.auth

import de.felix.shelterapp.user.UserRole
import io.smallrye.jwt.build.Jwt
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.util.*


fun createRefreshToken(username: String, id: UUID, ipAddress: String, userId: UUID, tenantId: UUID): String {
    return Jwt.claims()
        .upn(username)
        .issuedAt(Instant.now())
        .expiresAt(LocalDateTime.now(ZoneId.of("UTC")).plusDays(60).toInstant(ZoneOffset.UTC))
        .claim("type", TokenType.REFRESH)
        .claim("jti", id)
        .claim("ipAddress", ipAddress)
        .claim("userId", userId)
        .claim("tenantId", tenantId)
        .sign()
}

fun createAccessToken(refreshTokenId: UUID, username: String, role: UserRole, tenantId: UUID, ipAddress: String, userId: UUID): String {
    return Jwt.claims()
        .upn(username)
        .issuedAt(Instant.now())
        .expiresAt(LocalDateTime.now(ZoneId.of("UTC")).plusHours(1).toInstant(ZoneOffset.UTC))
        .claim("refreshTokenId", refreshTokenId)
        .claim("type", TokenType.ACCESS)
        .claim("tenantId", tenantId)
        .claim("ipAddress", ipAddress)
        .claim("userId", userId)
        .groups(role.name)
        .claim("jti", UUID.randomUUID())
        .sign()
}

fun createAnonymousToken(tenantId: UUID): String {
    return Jwt.claims()
        .claim("tenantId", tenantId)
        .sign()
}