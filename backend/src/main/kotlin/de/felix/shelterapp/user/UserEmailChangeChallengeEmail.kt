package de.felix.shelterapp.user

import de.felix.shelterapp.general.EmailData
import java.util.UUID

class UserEmailChangeChallengeEmail(
    newEmail: String,
    private val token: UUID,
    private val baseUrl: String
): EmailData(newEmail, "Ortify Email Change Confirmation") {
    override fun getBody(): String {
        return """
            <html>
                <body>
                    <p>
                        You are about to change you email address.
                    </p>
                    <p>
                        To confirm this change, please click the following link:
                        <a href="$baseUrl/users/email/change/confirm?token=$token">
                            Confirm Email Change
                        </a>
                    </p>
                </body>
            </html>
        """.trimIndent()
    }
}