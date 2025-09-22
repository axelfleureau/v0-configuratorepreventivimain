import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function setupAuth() {
  const supabase = createClientComponentClient()

  try {
    // Check if the admin user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const adminExists = existingUsers?.users.some((user) => user.email === "admin@righello.it")

    if (!adminExists) {
      // Create admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email: "admin@righello.it",
        password: "admin1234",
        email_confirm: true,
        user_metadata: {
          role: "admin",
        },
      })

      if (error) {
        console.error("Error creating admin user:", error)
        return false
      }

      console.log("Admin user created successfully")
    }

    return true
  } catch (error) {
    console.error("Error setting up authentication:", error)
    return false
  }
}
