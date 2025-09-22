"use client"

import { useEffect, useState } from "react"
import { useRealTimePackages } from "@/hooks/use-real-time-packages"

export function MissingTableNotice() {
  const { tableExists } = useRealTimePackages()
  const [dismissed, setDismissed] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  useEffect(() => {
    // Check if we've already dismissed this notice in this session
    const hasDismissed = sessionStorage.getItem("services-table-notice-dismissed")
    if (hasDismissed) {
      setDismissed(true)
    }
  }, [])

  if (tableExists || dismissed) return null

  const sqlScript = `
CREATE TABLE IF NOT EXISTS services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id  uuid REFERENCES packages(id) ON DELETE CASCADE,
  name        text NOT NULL,
  price       numeric NOT NULL,
  cycle       text NOT NULL CHECK (cycle IN ('one-off','monthly')),
  created_at  timestamp with time zone DEFAULT now()
);

INSERT INTO services (package_id, name, price, cycle)
VALUES
  (null, 'Basic maintenance', 150, 'monthly'),
  (null, 'SEO monitoring', 200, 'monthly'),
  (null, 'One-shot landing', 800, 'one-off')
ON CONFLICT DO NOTHING;
  `.trim()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const dismissNotice = () => {
    sessionStorage.setItem("services-table-notice-dismissed", "true")
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">Database Setup Required</h3>
        <button onClick={dismissNotice} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <p className="mb-2 text-sm">
        The <code className="bg-gray-100 px-1 rounded">services</code> table is missing in your database. The app is
        using fallback data for now.
      </p>
      <p className="mb-2 text-sm">To create the table, run this SQL in your Supabase dashboard:</p>
      <div className="relative">
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">{sqlScript}</pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 bg-white border rounded px-2 py-1 text-xs hover:bg-gray-50"
        >
          {showCopied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Note: The application will continue to work with fallback data until the table is created.
      </p>
    </div>
  )
}
