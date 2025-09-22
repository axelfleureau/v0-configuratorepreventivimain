import { createClient } from "@supabase/supabase-js"

export async function autoInitDatabase() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log("Supabase configuration missing, skipping auto-init")
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if services table exists
    const { error: checkError } = await supabase.from("services").select("id").limit(1)

    if (checkError && checkError.message.includes("does not exist")) {
      console.log("Services table does not exist, creating it...")

      // Create the services table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.services (
          id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          package_id  uuid REFERENCES public.packages(id) ON DELETE CASCADE,
          name        text NOT NULL,
          price       numeric NOT NULL,
          cycle       text NOT NULL CHECK (cycle IN ('one-off','monthly')),
          created_at  timestamp with time zone DEFAULT now()
        );
      `

      // Execute raw SQL using Supabase's SQL editor API
      const { error: createError } = await supabase
        .rpc("exec_sql", {
          sql_query: createTableSQL,
        })
        .single()

      if (createError) {
        // If exec_sql doesn't exist, try alternative approach
        console.log("Could not create table via RPC, trying alternative...")

        // Create table using Supabase client (this will work if user has permissions)
        const { error: altError } = await supabase
          .from("services")
          .insert([{ name: "Placeholder", price: 0, cycle: "monthly" }])

        if (altError) {
          console.error("Failed to create services table:", altError)
          return
        }
      }

      // Seed the table with initial data
      const { error: seedError } = await supabase.from("services").insert([
        { package_id: null, name: "Basic maintenance", price: 150, cycle: "monthly" },
        { package_id: null, name: "SEO monitoring", price: 200, cycle: "monthly" },
        { package_id: null, name: "One-shot landing", price: 800, cycle: "one-off" },
      ])

      if (seedError) {
        console.error("Failed to seed services table:", seedError)
      } else {
        console.log("Services table created and seeded successfully")
      }
    } else if (!checkError) {
      console.log("Services table already exists")
    }
  } catch (error) {
    console.error("Auto-init database error:", error)
  }
}
