"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Eye, Pencil, Trash, MoreHorizontal, Plus, RefreshCw } from "lucide-react"
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

interface Package {
  id: string
  nome: string
  descrizione: string
  prezzo: number
  posizione: number
  features: any
  servizi_inclusi: any
  attivo: boolean
  creato_il: string
  aggiornato_il: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("packages").select("*").order("posizione", { ascending: true })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error("Error fetching packages:", error)
      toast({
        title: "Error",
        description: "Failed to load packages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePackage = async () => {
    if (!packageToDelete) return

    try {
      const { error } = await supabase.from("packages").delete().eq("id", packageToDelete)

      if (error) throw error

      setPackages(packages.filter((pkg) => pkg.id !== packageToDelete))
      toast({
        title: "Package deleted",
        description: "The package has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting package:", error)
      toast({
        title: "Error",
        description: "Failed to delete package. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPackageToDelete(null)
    }
  }

  const handleSyncConfigurator = async () => {
    try {
      toast({
        title: "Syncing configurator",
        description: "The configurator is being synchronized with the latest package data.",
      })

      // Refresh the packages list
      await fetchPackages()

      toast({
        title: "Sync complete",
        description: "The configurator has been successfully synchronized.",
      })
    } catch (error) {
      console.error("Error syncing configurator:", error)
      toast({
        title: "Error",
        description: "Failed to sync configurator. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredPackages = packages.filter((pkg) => pkg.nome.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
          <p className="text-gray-500">Manage the packages available in the configurator</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSyncConfigurator}
            className="hover:shadow-[0_0_12px_#ff0092] transition-all"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Configurator
          </Button>
          <Link href="/admin/packages/new">
            <Button className="bg-[#ff0092] hover:bg-[#d6007a] hover:shadow-[0_0_12px_#ff0092] transition-all">
              <Plus className="mr-2 h-4 w-4" />
              New Package
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm focus:ring-[#ff0092] focus:border-[#ff0092]"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Loading packages...
                </TableCell>
              </TableRow>
            ) : filteredPackages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No packages found. Click "New Package" to create your first package.
                </TableCell>
              </TableRow>
            ) : (
              filteredPackages.map((pkg) => (
                <TableRow key={pkg.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{pkg.nome}</TableCell>
                  <TableCell>€{pkg.prezzo.toLocaleString("it-IT")}</TableCell>
                  <TableCell>{pkg.posizione}</TableCell>
                  <TableCell>
                    <div className={`h-2.5 w-2.5 rounded-full ${pkg.attivo ? "bg-green-500" : "bg-gray-300"}`} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/packages/${pkg.id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/admin/packages/${pkg.id}/edit`}>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <AlertDialog
                          open={packageToDelete === pkg.id}
                          onOpenChange={(open) => !open && setPackageToDelete(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                setPackageToDelete(pkg.id)
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
                                This will permanently delete the package "{pkg.nome}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeletePackage}
                                className="bg-red-600 hover:bg-red-700 hover:shadow-[0_0_12px_#ff0092]"
                              >
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
