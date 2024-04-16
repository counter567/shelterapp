package de.felix.shelterapp.user

import de.felix.shelterapp.user.UserRole
import de.felix.shelterapp.general.EmailData

class UserRegistrationEmail(
    email: String,
    private val role: UserRole = UserRole.USER,
    private val tenantName: String
) : EmailData(email, "Welcome to Ortify") {
    override fun getBody(): String {
        return """
            <html>
                <body>
                    <h1>Welcome to Ortify</h1>
                    <p>
                        You have been registered as a user in the Ortify system.
                        Your role is $role.
                    </p>
                    <p>
                        Your tenant is $tenantName.
                    </p>
                </body>
            </html>
        """.trimIndent()
    }

}

