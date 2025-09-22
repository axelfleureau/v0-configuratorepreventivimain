import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AdminProvider } from "@/components/admin/admin-provider"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { GlobalHeader } from "@/components/global-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Righello Admin Dashboard",
  description: "Admin dashboard for Righello Quote Configurator",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} min-h-screen flex pt-14`}>
      <GlobalHeader />
      <AdminProvider>
        <AdminSidebar />
        <div className="flex-1 p-8 bg-gray-50">{children}</div>
      </AdminProvider>
    </div>
  )
}
