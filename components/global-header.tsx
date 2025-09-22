"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Settings } from "lucide-react"
import { LoginPopup } from "@/components/login-popup"

export function GlobalHeader() {
  const [showLoginPopup, setShowLoginPopup] = useState(false)

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()

    // Check if user is already authenticated
    const cookies = document.cookie.split(";")
    const authCookie = cookies.find((cookie) => cookie.trim().startsWith("demo_auth="))

    if (authCookie) {
      // If authenticated, go directly to admin
      window.location.href = "/admin"
    } else {
      // If not authenticated, show login popup
      setShowLoginPopup(true)
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo_righello.png" alt="Righello Logo" width={140} height={40} />
        </Link>
        <button
          onClick={handleSettingsClick}
          className="p-2 rounded-full bg-white shadow-md hover:shadow-[0_0_12px_#ff0092] transition-shadow"
          title="Admin Dashboard"
        >
          <Settings className="h-5 w-5 text-[#ff0092]" />
        </button>
      </div>

      <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} redirectToAdmin={true} />
    </>
  )
}
