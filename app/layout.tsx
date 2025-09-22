import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { GlobalHeader } from "@/components/global-header"
import { DatabaseInitializer } from "@/components/database-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Righello - Configuratore Prezzi",
  description: "Configura il tuo preventivo personalizzato",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <GlobalHeader />
        {children}
        <Toaster />
        <DatabaseInitializer />
      </body>
    </html>
  )
}
