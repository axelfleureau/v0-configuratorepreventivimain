import type React from "react"
import { MissingTableNotice } from "@/components/missing-table-notice"

export default function ConfiguratoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
      <MissingTableNotice />
    </div>
  )
}
