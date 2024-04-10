package de.felix.shelterapp.util

import io.quarkus.hibernate.reactive.panache.Panache
import io.quarkus.hibernate.reactive.panache.kotlin.PanacheCompanionBase
import io.quarkus.hibernate.reactive.panache.kotlin.PanacheEntityBase
import io.quarkus.hibernate.reactive.panache.kotlin.PanacheQuery
import io.smallrye.mutiny.Uni
import io.smallrye.mutiny.coroutines.awaitSuspending
import java.util.*


interface PagedPanacheCompanion <Entity: PanacheEntityBase>: PanacheCompanionBase<Entity, UUID> {

    suspend fun query(parameters: PanacheQueryParameters): List<Entity> {
        val query = computeQuery(parameters.parameters)
        return this.handlePaging(query, parameters.page, parameters.pageSize)
            .list().awaitSuspending()
    }
    suspend fun count(parameters: PanacheCountParameters): Long {
        val query = computeQuery(parameters.parameters)
        return query.count().awaitSuspending()
    }
    fun handlePaging(query: PanacheQuery<Entity>, page: Int?, pageSize: Int): PanacheQuery<Entity> {
        if(pageSize < 1) {
            throw IllegalArgumentException("pageSize must be greater than 0")
        } else if(page != null && page < 0) {
            throw IllegalArgumentException("page must be greater than or equal to 0")
        } else if(pageSize > 50) {
            throw IllegalArgumentException("pageSize must be less or equal to 50")
        }
        return query.page(page ?: 0, pageSize)
    }
}


fun <T: PanacheEntityBase, K: Any> PanacheCompanionBase<T, K>.computeQuery(params: List<PanacheQueryParameter>): PanacheQuery<T> {
    val nonNullParams = params.filterNotNullValues()

    if(nonNullParams.isEmpty()) {
        return this.findAll()
    }
    val query = nonNullParams.joinToString(" and ", transform = PanacheQueryParameter::toQuery)
    val parameterMap = nonNullParams.toParameterMap()
    return this.find(query, parameterMap)
}


fun <R> withPanacheSession(block: suspend () -> R): Uni<R> = Panache.withSession {
    return@withSession coroutineAsUni { block() }
}

fun <R> withPanacheTransaction(block: suspend () -> R): Uni<R> = Panache.withTransaction {
    return@withTransaction coroutineAsUni { block() }
}


