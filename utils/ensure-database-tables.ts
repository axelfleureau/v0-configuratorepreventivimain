import { createClient } from "@supabase/supabase-js"

export async function ensureDatabaseTables() {
  try {
    // Use client-side available variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables")
      return false
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Check if quotes table exists (not quotes_generated)
    const { error } = await supabase.from("quotes").select("id").limit(1)

    if (error && error.message.includes("does not exist")) {
      // Table doesn't exist, trigger the setup API
      const response = await fetch("/api/setup-database")
      const result = await response.json()

      return result.success
    }

    // Table exists
    return true
  } catch (error) {
    console.error("Error checking database tables:", error)
    return false
  }
}
