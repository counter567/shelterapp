package de.felix.shelterapp.general

import io.quarkus.mailer.Mail
import io.quarkus.mailer.reactive.ReactiveMailer
import io.smallrye.mutiny.coroutines.awaitSuspending
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class EmailService(
    private val mailer: ReactiveMailer
) {
    suspend fun sendEmail(email: EmailData): Boolean {
        val mail = Mail.withHtml(
            email.email,
            email.subject,
            email.getBody()
        )
        mailer.send(mail).awaitSuspending()
        return true
    }
}