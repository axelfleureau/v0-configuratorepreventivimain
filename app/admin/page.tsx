"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalQuotes: number
  totalPackages: number
  quotesThisMonth: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    totalPackages: 0,
    quotesThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total quotes
        const { count: totalQuotes } = await supabase.from("quotes").select("*", { count: "exact", head: true })

        // Fetch total packages
        const { count: totalPackages } = await supabase.from("packages").select("*", { count: "exact", head: true })

        // Fetch quotes this month
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const { count: quotesThisMonth } = await supabase
          .from("quotes")
          .select("*", { count: "exact", head: true })
          .gte("created_at", firstDayOfMonth)

        setStats({
          totalQuotes: totalQuotes || 0,
          totalPackages: totalPackages || 0,
          quotesThisMonth: quotesThisMonth || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const statCards = [
    {
      title: "Total Quotes",
      value: stats.totalQuotes,
      description: "All quotes generated",
      icon: FileText,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Active Packages",
      value: stats.totalPackages,
      description: "Available in configurator",
      icon: Package,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Quotes This Month",
      value: stats.quotesThisMonth,
      description: "Generated in current month",
      icon: Calendar,
      color: "bg-pink-100 text-pink-700",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">Welcome to the Righello Admin Dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "-" : card.value.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your configurator</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link href="/admin/packages">
              <Card className="cursor-pointer hover:bg-gray-50/50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Packages</CardTitle>
                  <CardDescription>Manage, create, modify, or delete packages</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/admin/quotes">
              <Card className="cursor-pointer hover:bg-gray-50/50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Quotes</CardTitle>
                  <CardDescription>View, filter, and manage all generated quotes</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/admin/settings">
              <Card className="cursor-pointer hover:bg-gray-50/50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Settings</CardTitle>
                  <CardDescription>Configure company information and branding</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/">
              <Card className="cursor-pointer hover:bg-gray-50/50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Configurator</CardTitle>
                  <CardDescription>Go to the quote configurator</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest quotes and actions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">Loading recent activity...</p>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500">No recent activity found</p>
                <Button className="w-full bg-[#ff0092] hover:bg-[#d6007a] hover:shadow-[0_0_12px_#ff0092] transition-all">
                  View All Activity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
