"use client"

import Link from "next/link"
import Image from "next/image"
import { Settings } from "lucide-react"

export function AdminHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-2 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/images/logo_righello.png" alt="Righello Logo" width={140} height={40} />
      </Link>
      <Link
        href="/admin"
        className="p-2 rounded-full bg-white shadow-md hover:shadow-[0_0_12px_#ff0092] transition-shadow"
        title="Admin Dashboard"
      >
        <Settings className="h-5 w-5 text-[#ff0092]" />
      </Link>
    </div>
  )
}
