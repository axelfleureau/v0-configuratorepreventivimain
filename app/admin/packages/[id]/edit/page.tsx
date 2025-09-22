"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { serviceOptions } from "@/data/services-data"
import type { ServiceCategory } from "@/types"
import { uploadPackageImage, deletePackageImage } from "@/utils/image-upload"

interface PackageFormData {
  id: string
  nome: string
  descrizione: string
  prezzo: number
  posizione: number
  servizi_inclusi: any
  attivo: boolean
  border_color: string
  image_url: string
}

export default function EditPackagePage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<PackageFormData>({
    id: params.id,
    nome: "",
    descrizione: "",
    prezzo: 0,
    posizione: 0,
    servizi_inclusi: {},
    attivo: true,
    border_color: "#ff0092",
    image_url: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPackage()
  }, [params.id])

  const fetchPackage = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("packages").select("*").eq("id", params.id).single()

      if (error) throw error
      setFormData({
        id: data.id,
        nome: data.nome,
        descrizione: data.descrizione,
        prezzo: data.prezzo,
        posizione: data.posizione,
        servizi_inclusi: data.servizi_inclusi || {},
        attivo: data.attivo ?? true,
        border_color: data.border_color || "#ff0092",
        image_url: data.image_url || "",
      })
    } catch (error) {
      console.error("Error fetching package:", error)
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

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)

      // Se c'è già un'immagine, eliminala
      if (formData.image_url) {
        await deletePackageImage(formData.image_url)
      }

      const imageUrl = await uploadPackageImage(file, params.id)
      setFormData((prev) => ({ ...prev, image_url: imageUrl }))
      setImageFile(null)

      toast({
        title: "Image uploaded",
        description: "The package image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      if (formData.image_url) {
        await deletePackageImage(formData.image_url)
      }
      setFormData((prev) => ({ ...prev, image_url: "" }))
      setImageFile(null)

      toast({
        title: "Image removed",
        description: "The package image has been removed.",
      })
    } catch (error) {
      console.error("Error removing image:", error)
      toast({
        title: "Error",
        description: "Failed to remove image.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Se c'è un file da uploadare, fallo prima
      let finalImageUrl = formData.image_url
      if (imageFile) {
        finalImageUrl = await uploadPackageImage(imageFile, params.id)
      }

      // Usa una query SQL diretta per evitare problemi di cache
      const { error } = await supabase.rpc("update_package", {
        package_id: params.id,
        package_data: {
          nome: formData.nome,
          descrizione: formData.descrizione,
          prezzo: formData.prezzo,
          posizione: formData.posizione,
          servizi_inclusi: formData.servizi_inclusi,
          attivo: formData.attivo,
          aggiornato_il: new Date().toISOString(),
          border_color: formData.border_color,
          image_url: finalImageUrl,
        },
      })

      if (error) {
        // Fallback: usa update normale se la funzione non esiste
        const { error: updateError } = await supabase
          .from("packages")
          .update({
            nome: formData.nome,
            descrizione: formData.descrizione,
            prezzo: formData.prezzo,
            posizione: formData.posizione,
            servizi_inclusi: formData.servizi_inclusi,
            attivo: formData.attivo,
            aggiornato_il: new Date().toISOString(),
            ...(formData.border_color && { border_color: formData.border_color }),
            ...(finalImageUrl && { image_url: finalImageUrl }),
          })
          .eq("id", params.id)

        if (updateError) throw updateError
      }

      toast({
        title: "Package updated",
        description: "The package has been successfully updated.",
      })

      router.push(`/admin/packages/${params.id}`)
    } catch (error) {
      console.error("Error updating package:", error)
      toast({
        title: "Error",
        description: "Failed to update package. Please try again.",
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

      if (!updatedServices[category]) {
        updatedServices[category] = []
      }

      const serviceIndex = updatedServices[category].findIndex((s: any) => s.id === serviceId)

      if (serviceIndex >= 0) {
        updatedServices[category] = updatedServices[category].filter((s: any) => s.id !== serviceId)
        if (updatedServices[category].length === 0) {
          delete updatedServices[category]
        }
      } else {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="transition-all"
            style={{
              "--hover-shadow": `0 0 12px ${formData.border_color}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 12px ${formData.border_color}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <Link href={`/admin/packages/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Package</h1>
            <p className="text-gray-500">Update package details and included services</p>
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
                className="transition-all"
                style={{
                  "--focus-ring-color": formData.border_color,
                  "--focus-border-color": formData.border_color,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = formData.border_color
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${formData.border_color}33`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ""
                  e.currentTarget.style.boxShadow = ""
                }}
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
                className="transition-all"
                style={{
                  "--focus-ring-color": formData.border_color,
                  "--focus-border-color": formData.border_color,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = formData.border_color
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${formData.border_color}33`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ""
                  e.currentTarget.style.boxShadow = ""
                }}
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
                className="transition-all"
                style={{
                  "--focus-ring-color": formData.border_color,
                  "--focus-border-color": formData.border_color,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = formData.border_color
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${formData.border_color}33`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ""
                  e.currentTarget.style.boxShadow = ""
                }}
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
                className="transition-all"
                style={{
                  "--focus-ring-color": formData.border_color,
                  "--focus-border-color": formData.border_color,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = formData.border_color
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${formData.border_color}33`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = ""
                  e.currentTarget.style.boxShadow = ""
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="border_color">Selection Border Color</Label>
              <div className="flex gap-2">
                <Input
                  id="border_color"
                  type="color"
                  value={formData.border_color}
                  onChange={(e) => handleInputChange("border_color", e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={formData.border_color}
                  onChange={(e) => handleInputChange("border_color", e.target.value)}
                  placeholder="#ff0092"
                  className="flex-1 transition-all"
                  style={{
                    "--focus-ring-color": formData.border_color,
                    "--focus-border-color": formData.border_color,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = formData.border_color
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${formData.border_color}33`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = ""
                    e.currentTarget.style.boxShadow = ""
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">Color of the border when package is selected</p>
            </div>

            <div className="space-y-2">
              <Label>Package Image</Label>

              {/* Current Image Display */}
              {formData.image_url && (
                <div className="relative">
                  <img
                    src={formData.image_url || "/placeholder.svg"}
                    alt="Package preview"
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                    }
                  }}
                  className="transition-all"
                  style={{
                    "--focus-ring-color": formData.border_color,
                    "--focus-border-color": formData.border_color,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = formData.border_color
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${formData.border_color}33`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = ""
                    e.currentTarget.style.boxShadow = ""
                  }}
                />

                {imageFile && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => handleImageUpload(imageFile)}
                      disabled={uploading}
                      className="text-white transition-all"
                      style={{
                        backgroundColor: formData.border_color,
                        "--hover-bg": `${formData.border_color}dd`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${formData.border_color}dd`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = formData.border_color
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Image"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setImageFile(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* URL Input as alternative */}
              <div className="space-y-2">
                <Label htmlFor="image_url">Or enter image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange("image_url", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="transition-all"
                  style={{
                    "--focus-ring-color": formData.border_color,
                    "--focus-border-color": formData.border_color,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = formData.border_color
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${formData.border_color}33`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = ""
                    e.currentTarget.style.boxShadow = ""
                  }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="attivo"
                checked={formData.attivo}
                onCheckedChange={(checked) => {
                  if (checked) {
                    const checkbox = document.getElementById("attivo")
                    if (checkbox) {
                      checkbox.style.backgroundColor = formData.border_color
                      checkbox.style.borderColor = formData.border_color
                    }
                  }
                  handleInputChange("attivo", checked)
                }}
                className="transition-all"
                style={{
                  "--checked-bg": formData.border_color,
                  "--checked-border": formData.border_color,
                }}
              />
              <Label htmlFor="attivo" className="cursor-pointer">
                Active (visible in configurator)
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full transition-all text-white"
              style={{
                backgroundColor: formData.border_color,
                "--hover-bg": `${formData.border_color}dd`,
                "--hover-shadow": `0 0 12px ${formData.border_color}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${formData.border_color}dd`
                e.currentTarget.style.boxShadow = `0 0 12px ${formData.border_color}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = formData.border_color
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Package"}
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
                        className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 transition-all"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = formData.border_color
                          e.currentTarget.style.boxShadow = `0 0 8px ${formData.border_color}22`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e5e7eb"
                          e.currentTarget.style.boxShadow = "none"
                        }}
                      >
                        <Checkbox
                          id={service.id}
                          checked={isServiceIncluded(category as ServiceCategory, service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const checkbox = document.getElementById(service.id)
                              if (checkbox) {
                                checkbox.style.backgroundColor = formData.border_color
                                checkbox.style.borderColor = formData.border_color
                              }
                            }
                            handleServiceToggle(category as ServiceCategory, service.id)
                          }}
                          className="transition-all"
                          style={{
                            "--checked-bg": formData.border_color,
                            "--checked-border": formData.border_color,
                          }}
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
