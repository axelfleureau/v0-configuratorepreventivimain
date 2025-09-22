import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    // Server-side environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: "Missing Supabase configuration" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Read and execute SQL migration files
    const sqlDir = path.join(process.cwd(), "sql")

    // Get all SQL files and sort them alphabetically to ensure proper execution order
    const sqlFiles = fs
      .readdirSync(sqlDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    const results = []

    for (const file of sqlFiles) {
      try {
        const filePath = path.join(sqlDir, file)
        const sql = fs.readFileSync(filePath, "utf8")

        // Execute the SQL
        const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

        if (error) {
          // If exec_sql doesn't exist, try direct query
          const { error: directError } = await supabase.from("_dummy_query_").select("*").limit(1)

          results.push({
            file,
            success: false,
            message: error.message || directError?.message || "Unknown error",
          })
        } else {
          results.push({
            file,
            success: true,
            message: "Migration executed successfully",
          })
        }
      } catch (err: any) {
        results.push({
          file,
          success: false,
          message: err.message || "Unexpected error",
        })
      }
    }

    // Check if services table exists
    const { error: checkError } = await supabase.from("services").select("count").limit(1)

    if (checkError) {
      return NextResponse.json({
        success: false,
        message: "Services table creation failed",
        results,
        error: checkError.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      results,
    })
  } catch (error: any) {
    console.error("Error during database initialization:", error)
    return NextResponse.json({ success: false, message: error.message || "Unknown error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to initialize the database",
    endpoint: "/api/init-db",
    method: "POST",
  })
}
