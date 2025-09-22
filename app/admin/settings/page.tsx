"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Save, Upload } from "lucide-react"

interface CompanySettings {
  id?: number
  name: string
  vat_number: string
  email: string
  phone: string
  address: string
  website: string
  primary_color: string
  main_logo_url: string | null
  square_logo_url: string | null
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>({
    name: "Righello",
    vat_number: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    primary_color: "#ff0092",
    main_logo_url: null,
    square_logo_url: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mainLogoFile, setMainLogoFile] = useState<File | null>(null)
  const [squareLogoFile, setSquareLogoFile] = useState<File | null>(null)
  const [mainLogoPreview, setMainLogoPreview] = useState<string | null>(null)
  const [squareLogoPreview, setSquareLogoPreview] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      // First, check if the table exists
      const { error: tableCheckError } = await supabase.from("company_settings").select("id").limit(1)

      if (tableCheckError) {
        // Table doesn't exist, create it
        await createCompanySettingsTable()
      }

      const { data, error } = await supabase.from("company_settings").select("*").single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setSettings(data)
        if (data.main_logo_url) setMainLogoPreview(data.main_logo_url)
        if (data.square_logo_url) setSquareLogoPreview(data.square_logo_url)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load company settings. Using default values.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createCompanySettingsTable = async () => {
    try {
      // Create the table using SQL
      const sql = `
        CREATE TABLE IF NOT EXISTS company_settings (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL DEFAULT 'Righello',
          vat_number VARCHAR(255) DEFAULT '',
          email VARCHAR(255) DEFAULT 'info@righello.com',
          phone VARCHAR(255) DEFAULT '+39 123 456 7890',
          address TEXT DEFAULT 'Via Example 123, 12345 City',
          website VARCHAR(255) DEFAULT 'www.righello.com',
          primary_color VARCHAR(255) DEFAULT '#ff0092',
          main_logo_url TEXT DEFAULT NULL,
          square_logo_url TEXT DEFAULT NULL
        );
        
        INSERT INTO company_settings (id, name, vat_number, email, phone, address, website, primary_color)
        SELECT 1, 'Righello', '', 'info@righello.com', '+39 123 456 7890', 'Via Example 123, 12345 City', 'www.righello.com', '#ff0092'
        WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE id = 1);
      `

      await supabase.rpc("pgql", { query: sql })

      toast({
        title: "Settings initialized",
        description: "Company settings table has been created with default values.",
      })
    } catch (error) {
      console.error("Error creating company_settings table:", error)
      toast({
        title: "Error",
        description: "Failed to create settings table. Using default values.",
        variant: "destructive",
      })
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)

      // Check if the table exists
      const { error: tableCheckError } = await supabase.from("company_settings").select("id").limit(1)

      if (tableCheckError) {
        // Table doesn't exist, create it
        await createCompanySettingsTable()
      }

      let mainLogoUrl = settings.main_logo_url
      let squareLogoUrl = settings.square_logo_url

      // Upload main logo if a new one was selected
      if (mainLogoFile) {
        const fileExt = mainLogoFile.name.split(".").pop()
        const fileName = `main_logo_${Date.now()}.${fileExt}`

        // Check if the storage bucket exists
        const { data: buckets } = await supabase.storage.listBuckets()
        const assetsBucketExists = buckets?.some((bucket) => bucket.name === "company-assets")

        // Create the bucket if it doesn't exist
        if (!assetsBucketExists) {
          await supabase.storage.createBucket("company-assets", {
            public: true,
          })
        }

        const filePath = `company-assets/${fileName}`

        const { error: uploadError } = await supabase.storage.from("company-assets").upload(filePath, mainLogoFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from("company-assets").getPublicUrl(filePath)

        mainLogoUrl = data.publicUrl
      }

      // Upload square logo if a new one was selected
      if (squareLogoFile) {
        const fileExt = squareLogoFile.name.split(".").pop()
        const fileName = `square_logo_${Date.now()}.${fileExt}`

        // Check if the storage bucket exists
        const { data: buckets } = await supabase.storage.listBuckets()
        const assetsBucketExists = buckets?.some((bucket) => bucket.name === "company-assets")

        // Create the bucket if it doesn't exist
        if (!assetsBucketExists) {
          await supabase.storage.createBucket("company-assets", {
            public: true,
          })
        }

        const filePath = `company-assets/${fileName}`

        const { error: uploadError } = await supabase.storage.from("company-assets").upload(filePath, squareLogoFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from("company-assets").getPublicUrl(filePath)

        squareLogoUrl = data.publicUrl
      }

      const { error } = await supabase.from("company_settings").upsert({
        id: settings.id || 1,
        name: settings.name,
        vat_number: settings.vat_number,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        website: settings.website,
        primary_color: settings.primary_color,
        main_logo_url: mainLogoUrl,
        square_logo_url: squareLogoUrl,
      })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Company settings have been successfully updated.",
      })

      // Update settings with new logo URLs
      setSettings((prev) => ({
        ...prev,
        main_logo_url: mainLogoUrl,
        square_logo_url: squareLogoUrl,
      }))
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save company settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMainLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setMainLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setMainLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSquareLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSquareLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setSquareLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff0092] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-gray-500">Manage your company information and branding</p>
      </div>

      <Tabs defaultValue="company-data">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company-data">Company Data</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="company-data" className="mt-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>These details will appear in PDFs and other communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={settings.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="focus:ring-[#ff0092] focus:border-[#ff0092]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat-number">VAT Number</Label>
                  <Input
                    id="vat-number"
                    value={settings.vat_number}
                    onChange={(e) => handleInputChange("vat_number", e.target.value)}
                    className="focus:ring-[#ff0092] focus:border-[#ff0092]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="focus:ring-[#ff0092] focus:border-[#ff0092]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="focus:ring-[#ff0092] focus:border-[#ff0092]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="focus:ring-[#ff0092] focus:border-[#ff0092]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="focus:ring-[#ff0092] focus:border-[#ff0092]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="ml-auto bg-[#ff0092] hover:bg-[#d6007a] hover:shadow-[0_0_12px_#ff0092] transition-all"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logos" className="mt-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Company Logos</CardTitle>
              <CardDescription>Upload and manage your company logos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div>
                  <Label>Main Logo (Horizontal)</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Used in navigation and PDF headers. Recommended size: 200x80px
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  {mainLogoPreview && (
                    <div className="border rounded-md p-4 bg-gray-50 w-64 h-24 flex items-center justify-center">
                      <img
                        src={mainLogoPreview || "/placeholder.svg"}
                        alt="Main Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="main-logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md px-4 py-2">
                        <Upload className="h-4 w-4" />
                        <span>{mainLogoPreview ? "Change Logo" : "Upload Logo"}</span>
                      </div>
                      <input
                        id="main-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleMainLogoChange}
                      />
                    </Label>
                    {mainLogoPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMainLogoPreview(null)
                          setMainLogoFile(null)
                          handleInputChange("main_logo_url", "")
                        }}
                        className="mt-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Square Logo</Label>
                  <p className="text-sm text-gray-500 mb-2">Used for favicon and icons. Recommended size: 80x80px</p>
                </div>

                <div className="flex items-center gap-6">
                  {squareLogoPreview && (
                    <div className="border rounded-md p-4 bg-gray-50 w-24 h-24 flex items-center justify-center">
                      <img
                        src={squareLogoPreview || "/placeholder.svg"}
                        alt="Square Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="square-logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-md px-4 py-2">
                        <Upload className="h-4 w-4" />
                        <span>{squareLogoPreview ? "Change Logo" : "Upload Logo"}</span>
                      </div>
                      <input
                        id="square-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSquareLogoChange}
                      />
                    </Label>
                    {squareLogoPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSquareLogoPreview(null)
                          setSquareLogoFile(null)
                          handleInputChange("square_logo_url", "")
                        }}
                        className="mt-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="ml-auto bg-[#ff0092] hover:bg-[#d6007a] hover:shadow-[0_0_12px_#ff0092] transition-all"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Set your primary brand color used throughout the site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="primary-color">Primary Brand Color</Label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md border" style={{ backgroundColor: settings.primary_color }} />
                  <Input
                    id="primary-color"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => handleInputChange("primary_color", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => handleInputChange("primary_color", e.target.value)}
                    className="w-32 focus:ring-[#ff0092] focus:border-[#ff0092]"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  This color will be used for buttons, highlights, and accents throughout the application.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-medium">Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-md text-white flex items-center justify-center h-16"
                    style={{ backgroundColor: settings.primary_color }}
                  >
                    Primary Button
                  </div>
                  <div className="p-4 rounded-md border flex items-center justify-center h-16">
                    <span style={{ color: settings.primary_color }}>Text Color</span>
                  </div>
                  <div
                    className="p-4 rounded-md border-2 flex items-center justify-center h-16"
                    style={{ borderColor: settings.primary_color }}
                  >
                    Border Color
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="ml-auto bg-[#ff0092] hover:bg-[#d6007a] hover:shadow-[0_0_12px_#ff0092] transition-all"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
