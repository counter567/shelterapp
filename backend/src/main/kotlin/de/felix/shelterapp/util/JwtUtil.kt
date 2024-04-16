package de.felix.shelterapp.util

import de.felix.shelterapp.auth.TokenType
import de.felix.shelterapp.user.UserRole
import org.eclipse.microprofile.jwt.JsonWebToken
import java.util.*


fun JsonWebToken.getUsername(): String? = this.claim<String>("upn").orElse(null)
fun JsonWebToken.getTenantIdRaw(): String? = this.claim<String>("tenantId").orElse(null)
fun JsonWebToken.getRole(): UserRole? = this.groups?.firstOrNull()?.let { UserRole.valueOf(it) }
fun JsonWebToken.getRoleOrThrow() = this.getRole() ?: throw IllegalStateException("Role not found")
fun JsonWebToken.getTypeRaw(): String? = this.claim<String>("type").orElse(null)
fun JsonWebToken.getType(): TokenType? = this.getTypeRaw()?.let { TokenType.valueOf(it) }
fun JsonWebToken.getTenantId() = this.getTenantIdRaw()?.let { UUID.fromString(it) }
fun JsonWebToken.getIdRaw(): String? = this.claim<String>("jti").orElse(null)
fun JsonWebToken.getId() = this.getIdRaw()?.let { UUID.fromString(it) }

fun JsonWebToken.getIdOrThrow() = this.getId() ?: throw IllegalStateException("Id not found")
fun JsonWebToken.getRefreshTokenIdRaw(): String? = this.claim<String>("refreshTokenId").orElse(null)
fun JsonWebToken.getRefreshTokenId() = this.getRefreshTokenIdRaw()?.let { UUID.fromString(it) }
fun JsonWebToken.getRefreshTokenIdOrThrow() = this.getRefreshTokenId() ?: throw IllegalStateException("RefreshTokenId not found")
fun JsonWebToken.getTenantIdOrThrow() = this.getTenantId() ?: throw IllegalStateException("TenantId not found")
fun JsonWebToken.getUserIdRaw(): String? = this.claim<String>("userId").orElse(null)
fun JsonWebToken.getUserId() = this.getUserIdRaw()?.let { UUID.fromString(it) }
fun JsonWebToken.getUserIdOrThrow() = this.getUserId() ?: throw IllegalStateException("UserId not found")