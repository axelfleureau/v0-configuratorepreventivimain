"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SetupResult {
  success: boolean
  message: string
  needsManualSetup?: boolean
  sqlScript?: string
  details?: Array<{
    operation: string
    success: boolean
    error?: string
  }>
}

export function DatabaseInitializer() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [result, setResult] = useState<SetupResult | null>(null)
  const [visible, setVisible] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [showSQL, setShowSQL] = useState(false)
  const { toast } = useToast()

  const setupDatabase = async () => {
    try {
      setStatus("loading")
      setResult(null)

      const response = await fetch("/api/setup-database")
      const data = await response.json()

      setResult(data)
      setStatus(data.success ? "success" : "error")

      if (data.success) {
        setTimeout(() => setVisible(false), 5000)
      }
    } catch (error: any) {
      setStatus("error")
      setResult({
        success: false,
        message: error.message || "Failed to connect to setup API",
        needsManualSetup: true,
      })
    }
  }

  const copySQL = () => {
    if (result?.sqlScript) {
      navigator.clipboard.writeText(result.sqlScript)
      toast({
        title: "SQL copiato!",
        description: "Lo script SQL è stato copiato negli appunti.",
      })
    }
  }

  useEffect(() => {
    setupDatabase()
  }, [])

  if (!visible) return null

  return (
    <div className="mb-4">
      {status === "loading" && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Configurazione automatica del database in corso...</AlertDescription>
        </Alert>
      )}

      {status === "success" && result && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{result.message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && result && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <div className="w-full">
            <AlertTitle className="text-red-800 dark:text-red-200 font-medium">Setup Database Richiesto</AlertTitle>
            <AlertDescription className="text-red-800 dark:text-red-200">
              <p className="mb-3">{result.message}</p>

              {result.needsManualSetup && result.sqlScript && (
                <div className="space-y-3">
                  <p className="font-medium">
                    📋 <strong>Istruzioni per il setup manuale:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Vai al tuo dashboard Supabase</li>
                    <li>Apri l'editor SQL (SQL Editor)</li>
                    <li>Copia e incolla lo script SQL qui sotto</li>
                    <li>Esegui lo script</li>
                    <li>Ricarica questa pagina</li>
                  </ol>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSQL(!showSQL)}
                      className="flex items-center gap-1"
                    >
                      {showSQL ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Nascondi SQL
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Mostra SQL
                        </>
                      )}
                    </Button>

                    <Button variant="outline" size="sm" onClick={copySQL} className="flex items-center gap-1">
                      <Copy className="h-3 w-3" />
                      Copia SQL
                    </Button>
                  </div>

                  {showSQL && (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-md text-sm overflow-x-auto max-h-80 overflow-y-auto font-mono">
                      <pre className="whitespace-pre-wrap">{result.sqlScript}</pre>
                    </div>
                  )}
                </div>
              )}

              {result.details && result.details.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 mb-2"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Nascondi dettagli
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        Mostra dettagli
                      </>
                    )}
                  </Button>

                  {showDetails && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto max-h-60 overflow-y-auto">
                      <ul className="space-y-2">
                        {result.details.map((detail, index) => (
                          <li
                            key={index}
                            className={`p-2 rounded ${detail.success ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
                          >
                            <div className="flex items-start gap-2">
                              {detail.success ? (
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                              )}
                              <div>
                                <p className="font-medium">{detail.operation}</p>
                                {!detail.success && detail.error && (
                                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{detail.error}</p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button onClick={setupDatabase} size="sm">
                  Riprova configurazione
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                >
                  Apri Supabase Dashboard
                </Button>
              </div>
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}
