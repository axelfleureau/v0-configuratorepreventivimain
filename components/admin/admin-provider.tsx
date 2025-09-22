"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"

interface AdminContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AdminContext = createContext<AdminContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAdmin = () => useContext(AdminContext)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check for demo auth cookie
        const hasDemoAuth = document.cookie.includes("demo_auth=true")

        if (hasDemoAuth) {
          // Create a mock user for demo
          setUser({
            id: "demo-user",
            email: "admin@righello.it",
            app_metadata: {},
            user_metadata: { role: "admin" },
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as User)
        } else if (pathname !== "/admin/login") {
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        if (pathname !== "/admin/login") {
          router.push("/admin/login")
        }
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [pathname, router])

  const signOut = async () => {
    // Remove demo auth cookie
    document.cookie = "demo_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setUser(null)
    router.push("/admin/login")
  }

  if (loading && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff0092]" />
      </div>
    )
  }

  return <AdminContext.Provider value={{ user, loading, signOut }}>{children}</AdminContext.Provider>
}
