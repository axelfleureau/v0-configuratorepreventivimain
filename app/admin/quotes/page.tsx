"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileDown, MoreHorizontal, Search, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { downloadPDFFromDatabase } from "@/utils/pdf-generator-new"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Quote {
  id: string
  client_name: string
  client_email: string
  client_company: string | null
  client_phone: string
  package_type: string | null
  total_price: number
  created_at: string
  filename: string
  metadata: any
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    lastWeek: 0,
  })
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchQuotes()
    fetchStats()
  }, [])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setQuotes(data || [])
    } catch (error) {
      console.error("Errore caricamento preventivi:", error)
      toast({
        title: "Errore",
        description: "Impossibile caricare i preventivi.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastWeekDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { count: total } = await supabase.from("quotes").select("*", { count: "exact", head: true })

      const { count: thisMonth } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayOfMonth)

      const { count: lastWeekCount } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .gte("created_at", lastWeekDate)

      setStats({
        total: total || 0,
        thisMonth: thisMonth || 0,
        lastWeek: lastWeekCount || 0,
      })
    } catch (error) {
      console.error("Errore caricamento statistiche:", error)
    }
  }

  const handleDownloadPdf = async (quoteId: string) => {
    try {
      await downloadPDFFromDatabase(quoteId)
      toast({
        title: "Download completato",
        description: "Il PDF è stato scaricato con successo.",
      })
    } catch (error) {
      toast({
        title: "Errore download",
        description: "Impossibile scaricare il PDF.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return

    try {
      const { error } = await supabase.from("quotes").delete().eq("id", quoteToDelete)

      if (error) throw error

      setQuotes(quotes.filter((q) => q.id !== quoteToDelete))
      toast({
        title: "Preventivo eliminato",
        description: "Il preventivo è stato eliminato con successo.",
      })

      // Aggiorna le statistiche
      fetchStats()
    } catch (error) {
      console.error("Errore eliminazione preventivo:", error)
      toast({
        title: "Errore",
        description: "Impossibile eliminare il preventivo.",
        variant: "destructive",
      })
    } finally {
      setQuoteToDelete(null)
    }
  }

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.client_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.client_company && quote.client_company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preventivi</h1>
        <p className="text-gray-500">Visualizza e gestisci tutti i preventivi generati</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Preventivi Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Questo Mese</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ultimi 7 Giorni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.lastWeek}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cerca preventivi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 focus:ring-[#ff0092] focus:border-[#ff0092]"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Azienda</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Totale</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[80px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Caricamento preventivi...
                </TableCell>
              </TableRow>
            ) : filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nessun preventivo trovato
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{quote.client_name}</TableCell>
                  <TableCell>{quote.client_company || "-"}</TableCell>
                  <TableCell>{quote.client_email}</TableCell>
                  <TableCell>€{quote.total_price.toLocaleString("it-IT")}</TableCell>
                  <TableCell>
                    {new Date(quote.created_at).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <span className="sr-only">Apri menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownloadPdf(quote.id)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Scarica PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setQuoteToDelete(quote.id)} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!quoteToDelete} onOpenChange={() => setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà permanentemente il preventivo. Non sarà possibile recuperarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuote} className="bg-red-600 hover:bg-red-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
