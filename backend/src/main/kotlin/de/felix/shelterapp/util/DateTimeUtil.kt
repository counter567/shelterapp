package de.felix.shelterapp.util

import java.time.LocalDateTime
import java.time.ZoneOffset

fun utcNow() = LocalDateTime.now(ZoneOffset.UTC)