"use client"

import { useEffect, useState } from "react"

export function AutoDatabaseInit() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initMessage, setInitMessage] = useState("")

  useEffect(() => {
    const initDb = async () => {
      // Check if we've already tried to init in this session
      const hasInitialized = sessionStorage.getItem("db-auto-init")
      if (hasInitialized) return

      setIsInitializing(true)
      try {
        const response = await fetch("/api/auto-init")
        const data = await response.json()

        if (!data.success && data.sql) {
          console.error("Database initialization failed. Please run this SQL in your Supabase dashboard:", data.sql)
          setInitMessage("Database needs manual initialization. Check console for SQL.")
        } else if (data.success) {
          setInitMessage("Database initialized successfully!")
          sessionStorage.setItem("db-auto-init", "true")
        }
      } catch (error) {
        console.error("Failed to auto-initialize database:", error)
      } finally {
        setIsInitializing(false)
        // Hide message after 3 seconds
        setTimeout(() => setInitMessage(""), 3000)
      }
    }

    initDb()
  }, [])

  if (!isInitializing && !initMessage) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg max-w-sm">
      {isInitializing ? <p className="text-sm">Initializing database...</p> : <p className="text-sm">{initMessage}</p>}
    </div>
  )
}
