"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAdmin } from "./admin-provider"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, FileText, Settings, LogOut, ChevronRight, ChevronLeft } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Packages", href: "/admin/packages", icon: Package },
  { name: "Quotes", href: "/admin/quotes", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const { signOut } = useAdmin()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Don't render sidebar on login page
  if (pathname === "/admin/login") return null

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        {!collapsed && (
          <Link href="/admin" className="flex items-center">
            <Image src="/images/logo_righello.png" alt="Righello Logo" width={140} height={40} />
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-500">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:shadow-[0_0_12px_#ff0092]",
                  pathname === item.href
                    ? "bg-[#ff0092] text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-[0_0_12px_#ff0092]",
            collapsed && "justify-center",
          )}
          onClick={signOut}
        >
          <LogOut className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}
