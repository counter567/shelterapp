package de.felix.shelterapp.util

data class PanacheQueryParameters(
    val parameters: List<PanacheQueryParameter>,
    val page: Int = 0,
    val pageSize: Int = 20
)
