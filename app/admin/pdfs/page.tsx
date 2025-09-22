"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, FileDown, MoreHorizontal, Search, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PDF {
  id: string
  quote_id: string
  client_name: string
  file_name: string
  file_url: string
  created_at: string
  file_size: number
}

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pdfToDelete, setPdfToDelete] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPDFs()
  }, [])

  const fetchPDFs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("pdfs").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPdfs(data || [])
    } catch (error) {
      console.error("Error fetching PDFs:", error)
      toast({
        title: "Error",
        description: "Failed to load PDFs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePDF = async () => {
    if (!pdfToDelete) return

    try {
      // First, get the file path from the database
      const { data: pdfData, error: fetchError } = await supabase
        .from("pdfs")
        .select("file_url")
        .eq("id", pdfToDelete)
        .single()

      if (fetchError) throw fetchError

      // Extract the file path from the URL
      const fileUrl = pdfData.file_url
      const filePath = fileUrl.split("/").pop()

      // Delete the file from storage
      if (filePath) {
        const { error: storageError } = await supabase.storage.from("pdfs").remove([filePath])

        if (storageError) throw storageError
      }

      // Delete the record from the database
      const { error: deleteError } = await supabase.from("pdfs").delete().eq("id", pdfToDelete)

      if (deleteError) throw deleteError

      setPdfs(pdfs.filter((pdf) => pdf.id !== pdfToDelete))
      toast({
        title: "PDF deleted",
        description: "The PDF has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting PDF:", error)
      toast({
        title: "Error",
        description: "Failed to delete PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPdfToDelete(null)
    }
  }

  const handleViewPDF = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  const handleDownloadPDF = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filteredPDFs = pdfs.filter(
    (pdf) =>
      pdf.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.quote_id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PDFs</h1>
        <p className="text-gray-500">View and manage all generated PDFs</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>PDF Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pdfs.length}</div>
          <p className="text-sm text-gray-500">Total PDFs stored in the database</p>
        </CardContent>
      </Card>

      <div className="flex items-center py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search PDFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading PDFs...
                </TableCell>
              </TableRow>
            ) : filteredPDFs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No PDFs found
                </TableCell>
              </TableRow>
            ) : (
              filteredPDFs.map((pdf) => (
                <TableRow key={pdf.id}>
                  <TableCell className="font-medium">{pdf.quote_id}</TableCell>
                  <TableCell>{pdf.client_name}</TableCell>
                  <TableCell>{pdf.file_name}</TableCell>
                  <TableCell>{formatFileSize(pdf.file_size)}</TableCell>
                  <TableCell>
                    {new Date(pdf.created_at).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewPDF(pdf.file_url)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(pdf.file_url, pdf.file_name)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <AlertDialog
                          open={pdfToDelete === pdf.id}
                          onOpenChange={(open) => !open && setPdfToDelete(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                setPdfToDelete(pdf.id)
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the PDF file. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeletePDF} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
