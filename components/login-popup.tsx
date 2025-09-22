"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
  redirectToAdmin?: boolean
}

export function LoginPopup({ isOpen, onClose, redirectToAdmin = false }: LoginPopupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Demo login credentials
      if (email === "admin@righello.it" && password === "admin1234") {
        // Set demo auth cookie
        document.cookie = `demo_auth=true; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

        // Close the popup
        onClose()

        // Redirect to admin if requested
        if (redirectToAdmin) {
          router.push("/admin")
        } else {
          // Otherwise just refresh to update auth state
          router.refresh()
        }
      } else {
        setError("Credenziali non valide. Usa admin@righello.it / admin1234")
      }
    } catch (err) {
      setError("Si è verificato un errore durante il login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md rounded-xl">
        <CardHeader className="relative">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Chiudi</span>
          </Button>
          <CardTitle>Accedi a Righello</CardTitle>
          <CardDescription>Inserisci le tue credenziali per accedere al pannello amministrativo</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@azienda.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
              {isLoading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
