"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to configurator page
    router.push("/configuratore")
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse">Caricamento configuratore...</div>
    </div>
  )
}
