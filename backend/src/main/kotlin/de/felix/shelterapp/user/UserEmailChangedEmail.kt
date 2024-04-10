package de.felix.shelterapp.user

import de.felix.shelterapp.general.EmailData

class UserEmailChangedEmail(
    email: String
) : EmailData(email, "Ortify Email Change Confirmation") {
    override fun getBody(): String {
        return """
            <html>
                <body>
                    <p>
                        Your email address has been changed. Please contact us if you did not initiate this change.
                    </p>
                </body>
            </html>
        """.trimIndent()
    }
}