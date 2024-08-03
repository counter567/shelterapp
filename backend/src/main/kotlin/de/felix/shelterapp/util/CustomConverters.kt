package de.felix.shelterapp.util

import jakarta.ws.rs.ext.ParamConverter
import jakarta.ws.rs.ext.ParamConverterProvider
import jakarta.ws.rs.ext.Provider
import org.jboss.resteasy.reactive.server.core.parameters.converters.LocalDateTimeParamConverter
import org.jboss.resteasy.reactive.server.core.parameters.converters.TemporalParamConverter
import java.lang.reflect.Type
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@Provider
class CustomConverters: ParamConverterProvider {
    override fun <T : Any?> getConverter(
        rawType: Class<T>?,
        genericType: Type?,
        annotations: Array<out Annotation>?
    ): ParamConverter<T>? {
        return if(rawType != null && rawType == LocalDateTime::class.java) {
            CustomLocalDateTimeConverter() as ParamConverter<T>
        } else {
            null
        }
    }

}

class CustomLocalDateTimeConverter: ParamConverter<LocalDateTime> {
    override fun toString(value: LocalDateTime?): String? {
        return value?.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
    }

    override fun fromString(value: String?): LocalDateTime? {
        return value?.let {
            if(value.contains("[+-]00:00".toRegex())) {
                return OffsetDateTime.parse(value).atZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime()
            } else {
                LocalDateTime.parse(value)
            }
        }
    }

}