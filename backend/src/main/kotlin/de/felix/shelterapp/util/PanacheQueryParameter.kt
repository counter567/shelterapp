package de.felix.shelterapp.util


data class PanacheQueryParameter(
    val name: String,
    val value: Any?,
    val type: Type = Type.EQUALS,
) {
    fun toQuery() = when(type) {
        Type.EQUALS -> "$name = :$name"
        Type.LIKE -> "lower($name) like concat('%',lower(:$name),'%')"
        Type.GREATER_THAN -> "$name > :$name"
        Type.LESS_THAN -> "$name < :$name"
        Type.GREATER_THAN_OR_EQUALS -> "$name >= :$name"
        Type.LESS_THAN_OR_EQUALS -> "$name <= :$name"
        Type.IN -> "$name in :$name"
        Type.NOT_IN -> "$name not in :$name"
    }
    enum class Type {
        EQUALS, LIKE, GREATER_THAN, LESS_THAN, GREATER_THAN_OR_EQUALS, LESS_THAN_OR_EQUALS, IN, NOT_IN
    }
}



fun Iterable<PanacheQueryParameter>.filterNotNullValues() = this.filter { it.value != null }
fun Iterable<PanacheQueryParameter>.toParameterMap() = this.associate { it.name to it.value!! }