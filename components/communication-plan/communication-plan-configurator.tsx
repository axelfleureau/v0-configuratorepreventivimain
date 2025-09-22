"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Linkedin, Music, Twitter, Youtube } from "lucide-react"
import { useConfiguratorStore } from "@/store/configurator-store"
import { useToast } from "@/components/ui/use-toast"
import { CommunicationPlanCircle } from "@/components/communication-plan/communication-plan-circle"

const platformOptions = [
  { id: "instagram", name: "Instagram", icon: Instagram, included: true, cost: 0 },
  { id: "facebook", name: "Facebook", icon: Facebook, included: true, cost: 0 },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, included: false, cost: 100 },
  { id: "tiktok", name: "TikTok", icon: Music, included: false, cost: 50 },
  { id: "twitter", name: "Twitter", icon: Twitter, included: false, cost: 25 },
  { id: "youtube", name: "YouTube", icon: Youtube, included: false, cost: 75 },
]

export function CommunicationPlanConfigurator() {
  const { toast } = useToast()
  const { services, addService, removeService, showVatPrices } = useConfiguratorStore()

  const [selectedPlan, setSelectedPlan] = useState<string>("none")
  const [customPlatforms, setCustomPlatforms] = useState<string[]>(["instagram", "facebook"])
  const [customPosts, setCustomPosts] = useState(4)
  const [customStories, setCustomStories] = useState(4)
  const [initialContent, setInitialContent] = useState<string>("content-0")
  const [frequency, setFrequency] = useState<string>("frequency-1-2")

  // Calcolo del grado per piano custom
  const calculateCustomDegree = () => {
    const platformFactor = (customPlatforms.length / 3) * 40
    const postsFactor = (customPosts / 8) * 180
    const storiesFactor = (customStories / 8) * 90
    return Math.min(360, platformFactor + postsFactor + storiesFactor)
  }

  // Calcolo prezzo piano custom
  const calculateCustomPrice = () => {
    const degree = calculateCustomDegree()
    const basePrice = 300
    const additionalPrice = degree > 90 ? ((degree - 90) / 90) * 250 : 0
    const platformCosts = customPlatforms.reduce((total, platformId) => {
      const platform = platformOptions.find((p) => p.id === platformId)
      return total + (platform?.cost || 0)
    }, 0)
    return Math.round(basePrice + additionalPrice + platformCosts)
  }

  // Ottieni il grado corrente
  const getCurrentDegree = () => {
    switch (selectedPlan) {
      case "plan-90":
        return 90
      case "plan-180":
        return 180
      case "plan-360":
        return 360
      case "custom":
        return calculateCustomDegree()
      default:
        return 0
    }
  }

  // Ottieni il prezzo corrente
  const getCurrentPrice = () => {
    switch (selectedPlan) {
      case "plan-90":
        return 300
      case "plan-180":
        return 800
      case "plan-360":
        return 1600
      case "custom":
        return calculateCustomPrice()
      default:
        return 0
    }
  }

  // Gestione aggiunta piano
  const handleAddPlan = () => {
    // Rimuovi piani precedenti
    services
      .filter((s) => s.id.startsWith("plan-") || s.id === "communication-custom")
      .forEach((s) => removeService(s.id))

    if (selectedPlan !== "none") {
      const price = getCurrentPrice()
      const finalPrice = showVatPrices ? Math.round(price * 1.22) : price

      if (selectedPlan === "custom") {
        addService({
          id: "communication-custom",
          name: `Piano Personalizzato ${getCurrentDegree()}°`,
          description: `${customPosts} post, ${customStories} stories, ${customPlatforms.length} piattaforme`,
          price: finalPrice,
          priceMonthly: finalPrice,
          type: "monthly",
        })
      } else {
        const planName =
          selectedPlan === "plan-90" ? "Piano 90°" : selectedPlan === "plan-180" ? "Piano 180°" : "Piano 360°"
        addService({
          id: selectedPlan,
          name: planName,
          description: "Piano di comunicazione social media",
          price: finalPrice,
          priceMonthly: finalPrice,
          type: "monthly",
        })
      }
    }

    // Gestione contenuti iniziali
    services.filter((s) => s.id.startsWith("content-")).forEach((s) => removeService(s.id))

    if (initialContent !== "content-0") {
      const contentPrices: Record<string, number> = {
        "content-5": 1500,
        "content-10": 2500,
        "content-15": 3500,
      }
      const contentPrice = contentPrices[initialContent] || 0
      const finalContentPrice = showVatPrices ? Math.round(contentPrice * 1.22) : contentPrice

      addService({
        id: initialContent,
        name: `${initialContent.split("-")[1]} contenuti iniziali`,
        description: "Contenuti per partire con il piano",
        price: finalContentPrice,
        priceOneTime: finalContentPrice,
        type: "oneTime",
      })
    }

    // Gestione frequenza
    services.filter((s) => s.id.startsWith("frequency-")).forEach((s) => removeService(s.id))

    if (frequency === "frequency-3-4") {
      const frequencyPrice = showVatPrices ? Math.round(300 * 1.22) : 300
      addService({
        id: frequency,
        name: "Frequenza elevata (3-4 uscite/settimana)",
        description: "Pubblicazione più frequente",
        price: frequencyPrice,
        priceMonthly: frequencyPrice,
        type: "monthly",
      })
    }

    toast({
      title: "Piano aggiornato",
      description:
        selectedPlan === "none" ? "Piano di comunicazione rimosso" : "Piano di comunicazione aggiunto al preventivo",
    })
  }

  // Gestisce il cambio del valore dello slider dei post
  const handlePostsChange = (value: number[]) => {
    setCustomPosts(value[0])
  }

  // Gestisce il cambio del valore dello slider delle stories
  const handleStoriesChange = (value: number[]) => {
    setCustomStories(value[0])
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Piano di Comunicazione</h2>
        <p className="text-gray-600">Strategia e gestione della comunicazione sui social media</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visualizzazione cerchio */}
        <div className="lg:col-span-1">
          <Card className="p-6 text-center">
            <CommunicationPlanCircle degree={getCurrentDegree()} />
            <div className="mt-4">
              <div className="text-2xl font-bold text-[#ff0092]">
                {getCurrentPrice() > 0 ? (
                  <>
                    {getCurrentPrice().toLocaleString("it-IT")} €{showVatPrices ? "" : " +IVA"}/mese
                  </>
                ) : (
                  "0 €"
                )}
              </div>
              {selectedPlan === "custom" && getCurrentDegree() > 0 && (
                <Badge variant="secondary" className="mt-2">
                  Equivalente a Piano {Math.round(getCurrentDegree())}°
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Configurazione piano */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selezione tipo piano */}
          <Card>
            <CardHeader>
              <CardTitle>Seleziona il Piano</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="cursor-pointer">
                      <div>
                        <span className="font-medium">Nessun Piano</span>
                        <p className="text-sm text-gray-500">Non includere servizi di comunicazione</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="plan-90" id="plan-90" />
                    <Label htmlFor="plan-90" className="cursor-pointer">
                      <div>
                        <span className="font-medium">Piano 90° - 300 €/mese</span>
                        <p className="text-sm text-gray-500">2 post + 2 stories, 1 piattaforma (IG o FB)</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="plan-180" id="plan-180" />
                    <Label htmlFor="plan-180" className="cursor-pointer">
                      <div>
                        <span className="font-medium">Piano 180° - 800 €/mese</span>
                        <p className="text-sm text-gray-500">4 post + 4 stories, 2 piattaforme</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="plan-360" id="plan-360" />
                    <Label htmlFor="plan-360" className="cursor-pointer">
                      <div>
                        <span className="font-medium">Piano 360° - 1.600 €/mese</span>
                        <p className="text-sm text-gray-500">8 post + 8 stories, 3+ piattaforme + gestione DM</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="cursor-pointer">
                      <div>
                        <span className="font-medium">Piano Personalizzato</span>
                        <p className="text-sm text-gray-500">Configura il piano in base alle tue esigenze</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Configurazione piano custom */}
          {selectedPlan === "custom" && (
            <Card>
              <CardHeader>
                <CardTitle>Personalizza il Piano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Piattaforme */}
                <div>
                  <Label className="text-base font-semibold">Piattaforme</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {platformOptions.map((platform) => {
                      const Icon = platform.icon
                      const isChecked = customPlatforms.includes(platform.id)
                      return (
                        <div key={platform.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform.id}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCustomPlatforms([...customPlatforms, platform.id])
                              } else {
                                if (customPlatforms.length > 1) {
                                  setCustomPlatforms(customPlatforms.filter((p) => p !== platform.id))
                                }
                              }
                            }}
                            className="data-[state=checked]:bg-[#ff0092] data-[state=checked]:border-[#ff0092]"
                          />
                          <Label htmlFor={platform.id} className="flex items-center gap-2 cursor-pointer">
                            <Icon className="h-4 w-4" />
                            {platform.name}
                            {platform.cost > 0 && (
                              <Badge variant="outline" className="text-xs">
                                +{platform.cost} €/mese
                              </Badge>
                            )}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Post */}
                <div>
                  <Label className="text-base font-semibold">Numero di post al mese: {customPosts}</Label>
                  <Slider
                    value={[customPosts]}
                    onValueChange={handlePostsChange}
                    max={12}
                    min={1}
                    step={1}
                    className="mt-3"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>6</span>
                    <span>12</span>
                  </div>
                </div>

                {/* Stories */}
                <div>
                  <Label className="text-base font-semibold">Numero di stories al mese: {customStories}</Label>
                  <Slider
                    value={[customStories]}
                    onValueChange={handleStoriesChange}
                    max={30}
                    min={1}
                    step={1}
                    className="mt-3"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>15</span>
                    <span>30</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenuti iniziali e frequenza */}
          {selectedPlan !== "none" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Contenuti Iniziali</CardTitle>
                  <CardDescription>Contenuti per partire con il piano di comunicazione</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={initialContent} onValueChange={setInitialContent}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="content-0" id="content-0" />
                        <Label htmlFor="content-0">Nessun contenuto iniziale (0 €)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="content-5" id="content-5" />
                        <Label htmlFor="content-5">5 contenuti (1.500 €)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="content-10" id="content-10" />
                        <Label htmlFor="content-10">10 contenuti (2.500 €)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="content-15" id="content-15" />
                        <Label htmlFor="content-15">15 contenuti (3.500 €)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Frequenza Pubblicazione</CardTitle>
                  <CardDescription>Numero di uscite settimanali</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={frequency} onValueChange={setFrequency}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="frequency-1-2" id="frequency-1-2" />
                        <Label htmlFor="frequency-1-2">1-2 uscite/settimana (incluso)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="frequency-3-4" id="frequency-3-4" />
                        <Label htmlFor="frequency-3-4">3-4 uscite/settimana (+300 €/mese)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </>
          )}

          <div className="text-center">
            <Button
              onClick={handleAddPlan}
              className="bg-[#ff0092] hover:bg-[#d6007a] text-white px-8 py-3 text-lg rounded-full"
            >
              {selectedPlan === "none" ? "Rimuovi dal preventivo" : "Aggiungi al preventivo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
