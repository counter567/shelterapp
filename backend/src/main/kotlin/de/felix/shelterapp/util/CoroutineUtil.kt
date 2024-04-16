package de.felix.shelterapp.util

import io.quarkus.arc.Arc
import io.quarkus.scheduler.kotlin.runtime.ApplicationCoroutineScope
import io.smallrye.common.vertx.VertxContext
import io.smallrye.mutiny.Uni
import io.smallrye.mutiny.coroutines.asUni
import io.vertx.core.Vertx
import io.vertx.kotlin.coroutines.dispatcher
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.async

@OptIn(ExperimentalCoroutinesApi::class)
fun <T> coroutineAsUni(block: suspend () -> T): Uni<T> {
    val coroutineScope = Arc.container().instance(ApplicationCoroutineScope::class.java).get()
    val vertx = Arc.container().instance(Vertx::class.java).get()
    val dispatcher: CoroutineDispatcher = VertxContext.getOrCreateDuplicatedContext(vertx).dispatcher()
    return coroutineScope.async(dispatcher) {
        block()
    }.asUni()
}