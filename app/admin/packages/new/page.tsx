"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { serviceOptions } from "@/data/services-data"
import type { ServiceCategory } from "@/types"

interface PackageFormData {
  nome: string
  descrizione: string
  prezzo: number
  posizione: number
  servizi_inclusi: any
  attivo: boolean
  border_color: string
  image_url: string
}

export default function NewPackagePage() {
  const [formData, setFormData] = useState<PackageFormData>({
    nome: "",
    descrizione: "",
    prezzo: 0,
    posizione: 0,
    servizi_inclusi: {},
    attivo: true,
    border_color: "#e5e7eb",
    image_url: "",
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSave = async () => {
    try {
      setSaving(true)

      const { data, error } = await supabase
        .from("packages")
        .insert({
          nome: formData.nome,
          descrizione: formData.descrizione,
          prezzo: formData.prezzo,
          posizione: formData.posizione,
          servizi_inclusi: formData.servizi_inclusi,
          attivo: formData.attivo,
          border_color: formData.border_color,
          image_url: formData.image_url,
          creato_il: new Date().toISOString(),
          aggiornato_il: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast({
        title: "Package created",
        description: "The package has been successfully created.",
      })

      router.push(`/admin/packages/${data[0].id}`)
    } catch (error) {
      console.error("Error creating package:", error)
      toast({
        title: "Error",
        description: "Failed to create package. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof PackageFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleServiceToggle = (category: ServiceCategory, serviceId: string) => {
    setFormData((prev) => {
      const updatedServices = { ...prev.servizi_inclusi }

      // Initialize category if it doesn't exist
      if (!updatedServices[category]) {
        updatedServices[category] = []
      }

      // Check if service already exists in the category
      const serviceIndex = updatedServices[category].findIndex((s: any) => s.id === serviceId)

      if (serviceIndex >= 0) {
        // Remove service if it exists
        updatedServices[category] = updatedServices[category].filter((s: any) => s.id !== serviceId)
        if (updatedServices[category].length === 0) {
          delete updatedServices[category]
        }
      } else {
        // Add service if it doesn't exist
        const serviceToAdd = serviceOptions[category].find((s) => s.id === serviceId)
        if (serviceToAdd) {
          updatedServices[category] = [...(updatedServices[category] || []), { id: serviceId, name: serviceToAdd.name }]
        }
      }

      return {
        ...prev,
        servizi_inclusi: updatedServices,
      }
    })
  }

  const isServiceIncluded = (category: ServiceCategory, serviceId: string) => {
    if (!formData.servizi_inclusi || !formData.servizi_inclusi[category]) {
      return false
    }
    return formData.servizi_inclusi[category].some((s: any) => s.id === serviceId)
  }

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
            <h1 className="text-3xl font-bold tracking-tight">New Package</h1>
            <p className="text-gray-500">Create a new package for the configurator</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Package Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Package Name</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
                className="focus:ring-[#ff0092] focus:border-[#ff0092]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prezzo">Price (€)</Label>
              <Input
                id="prezzo"
                type="number"
                value={formData.prezzo}
                onChange={(e) => handleInputChange("prezzo", Number.parseFloat(e.target.value))}
                required
                className="focus:ring-[#ff0092] focus:border-[#ff0092]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="posizione">Position</Label>
              <Input
                id="posizione"
                type="number"
                value={formData.posizione}
                onChange={(e) => handleInputChange("posizione", Number.parseInt(e.target.value))}
                required
                className="focus:ring-[#ff0092] focus:border-[#ff0092]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descrizione">Description</Label>
              <Textarea
                id="descrizione"
                value={formData.descrizione}
                onChange={(e) => handleInputChange("descrizione", e.target.value)}
                rows={4}
                required
                className="focus:ring-[#ff0092] focus:border-[#ff0092]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="border_color">Border Color</Label>
              <Input
                id="border_color"
                type="text"
                value={formData.border_color}
                onChange={(e) => handleInputChange("border_color", e.target.value)}
                required
                className="focus:ring-[#ff0092] focus:border-[#ff0092]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="text"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                className="focus:ring-[#ff0092] focus:border-[#ff0092]"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="attivo"
                checked={formData.attivo}
                onCheckedChange={(checked) => handleInputChange("attivo", checked)}
                className="data-[state=checked]:bg-[#ff0092] data-[state=checked]:border-[#ff0092]"
              />
              <Label htmlFor="attivo" className="cursor-pointer">
                Active (visible in configurator)
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.nome || formData.prezzo <= 0}
              className="w-full bg-[#ff0092] hover:bg-[#d6007a] hover:shadow-[0_0_12px_#ff0092] transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Create Package"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Included Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Object.keys(serviceOptions).map((category) => (
                <div key={category} className="space-y-4">
                  <h3 className="font-medium capitalize">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {serviceOptions[category as ServiceCategory].map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 hover:border-[#ff0092] transition-colors"
                      >
                        <Checkbox
                          id={service.id}
                          checked={isServiceIncluded(category as ServiceCategory, service.id)}
                          onCheckedChange={() => handleServiceToggle(category as ServiceCategory, service.id)}
                          className="data-[state=checked]:bg-[#ff0092] data-[state=checked]:border-[#ff0092]"
                        />
                        <div className="flex-1">
                          <Label htmlFor={service.id} className="cursor-pointer font-medium">
                            {service.name}
                          </Label>
                          <p className="text-xs text-gray-500">{service.description}</p>
                        </div>
                        <span className="text-sm font-medium">€{service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
