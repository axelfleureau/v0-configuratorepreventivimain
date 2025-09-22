"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Pencil, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PackageDetail {
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
  border_color: string | null
  image_url: string | null
}

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPackageDetail()
  }, [params.id])

  const fetchPackageDetail = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("packages").select("*").eq("id", params.id).single()

      if (error) throw error
      setPackageDetail(data)
    } catch (error) {
      console.error("Error fetching package detail:", error)
      toast({
        title: "Error",
        description: "Failed to load package details. Please try again.",
        variant: "destructive",
      })
      router.push("/admin/packages")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff0092] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading package details...</p>
        </div>
      </div>
    )
  }

  if (!packageDetail) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Package not found</h2>
        <p className="text-gray-500 mt-2">The requested package could not be found.</p>
        <Button asChild className="mt-6 hover:shadow-[0_0_12px_#ff0092]">
          <Link href="/admin/packages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Link>
        </Button>
      </div>
    )
  }

  // Parse included services
  const includedServices = packageDetail.servizi_inclusi || {}

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="hover:shadow-[0_0_12px_#ff0092]">
            <Link href="/admin/packages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{packageDetail.nome}</h1>
            <p className="text-gray-500">Package details and included services</p>
          </div>
        </div>
        <Button asChild className="bg-[#ff0092] hover:bg-[#d6007a] hover:shadow-[0_0_12px_#ff0092] transition-all">
          <Link href={`/admin/packages/${params.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Package
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Package Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{packageDetail.nome}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Price</h3>
              <p className="mt-1 text-xl font-bold text-[#ff0092]">€{packageDetail.prezzo.toLocaleString("it-IT")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{packageDetail.descrizione}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Position</h3>
              <p className="mt-1">{packageDetail.posizione}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1 flex items-center">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${
                    packageDetail.attivo ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                {packageDetail.attivo ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Border Color</h3>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: packageDetail.border_color || "#e5e7eb" }}
                />
                <span>{packageDetail.border_color || "#e5e7eb"}</span>
              </div>
            </div>
            {packageDetail.image_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Package Image</h3>
                <img
                  src={packageDetail.image_url || "/placeholder.svg"}
                  alt={packageDetail.nome}
                  className="mt-1 w-16 h-16 object-cover rounded-lg border"
                />
              </div>
            )}
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1">
                {new Date(packageDetail.creato_il).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1">
                {new Date(packageDetail.aggiornato_il).toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Included Services</CardTitle>
            <CardDescription>Services that are included in this package</CardDescription>
          </CardHeader>
          <CardContent>
            {!packageDetail.servizi_inclusi || Object.keys(packageDetail.servizi_inclusi).length === 0 ? (
              <p className="text-gray-500">No services included in this package.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(packageDetail.servizi_inclusi).map(([category, services]) => (
                  <div key={category}>
                    <h3 className="font-medium mb-3 capitalize">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Array.isArray(services) &&
                        services.map((service: any) => (
                          <div
                            key={service.id || service.name}
                            className="flex items-center p-2 rounded-md border border-gray-200 hover:border-[#ff0092] transition-colors"
                          >
                            <Check className="h-4 w-4 text-[#ff0092] mr-2" />
                            <span>{service.name || service.id || "Service"}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
