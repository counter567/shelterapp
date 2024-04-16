package de.felix.shelterapp.general

abstract class EmailData(
    val email: String,
    val subject: String
) {
    abstract fun getBody(): String
}