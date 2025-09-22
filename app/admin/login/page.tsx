"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { GlobalHeader } from "@/components/global-header"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@righello.it")
  const [password, setPassword] = useState("admin1234")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Demo authentication - check credentials locally
      if (email === "admin@righello.it" && password === "admin1234") {
        // Set authentication cookie for demo
        document.cookie = "demo_auth=true; path=/; max-age=86400" // 24 hours

        // Small delay to simulate authentication
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Redirect to admin dashboard
        router.push("/admin")
        router.refresh()
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError("Invalid credentials. Please use the demo credentials provided.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <GlobalHeader />
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#ff0092] hover:bg-[#d6007a]" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-sm text-gray-500 p-3 bg-gray-100 rounded">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <p>Email: admin@righello.it</p>
              <p>Password: admin1234</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center text-sm text-gray-500">
            <Link href="/" className="hover:text-[#ff0092] transition-colors">
              Back to Configurator
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
