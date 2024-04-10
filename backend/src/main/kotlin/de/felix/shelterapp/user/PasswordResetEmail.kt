package de.felix.shelterapp.user

import de.felix.shelterapp.general.EmailData

class PasswordResetEmail(
    val resetLink: String,
    email: String
): EmailData(email, "Ortify Password Reset") {
    override fun getBody(): String = """
        <html>
            <body>
                <p>
                    You have requested a password reset for your Ortify account. Please click the following link to reset your password:
                </p>
                <a href="$resetLink">$resetLink</a>
                <p>
                    If you did not request this password reset, please ignore this email.
                </p>
            </body>
        </html>
    """.trimIndent()
}