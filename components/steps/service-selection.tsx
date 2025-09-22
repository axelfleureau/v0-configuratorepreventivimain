"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Instagram,
  Facebook,
  Linkedin,
  Music,
  Twitter,
  Youtube,
  Check,
  Plus,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useConfiguratorStore } from "@/store/configurator-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Fattori di peso specifici per il calcolo del grado
const PLATFORM_WEIGHT = 40 // Peso massimo piattaforme
const POSTS_WEIGHT = 180 // Peso massimo post
const STORIES_WEIGHT = 90 // Peso massimo stories
const CONTENT_TYPE_WEIGHT = 50 // Peso massimo tipo contenuto

// Prezzi fissi di riferimento
const PRICE_90 = 300
const PRICE_180 = 800
const PRICE_360 = 1600

interface PlatformOption {
  id: string
  name: string
  icon: string
  included: boolean
  cost: number
}

interface PredefinedPlan {
  type: "90" | "180" | "360"
  name: string
  price: number
  degree: number
  platforms: string[]
  posts: number
  stories: number
  contentType: "graphics" | "photos" | "mix"
  features: string[]
}

const platformOptions: PlatformOption[] = [
  { id: "instagram", name: "Instagram", icon: "Instagram", included: true, cost: 0 },
  { id: "facebook", name: "Facebook", icon: "Facebook", included: true, cost: 0 },
  { id: "linkedin", name: "LinkedIn", icon: "Linkedin", included: false, cost: 100 },
  { id: "tiktok", name: "TikTok", icon: "Music", included: false, cost: 50 },
  { id: "twitter", name: "Twitter", icon: "Twitter", included: false, cost: 25 },
  { id: "youtube", name: "YouTube", icon: "Youtube", included: false, cost: 75 },
]

const predefinedPlans: PredefinedPlan[] = [
  {
    type: "90",
    name: "Piano Base - 90°",
    price: PRICE_90,
    degree: 90,
    platforms: ["instagram"],
    posts: 2,
    stories: 2,
    contentType: "graphics",
    features: [
      "2 post al mese su 1 piattaforma (Instagram o Facebook)",
      "2 stories al mese",
      "Contenuti principalmente grafici",
      "Report mensile base",
    ],
  },
  {
    type: "180",
    name: "Piano Avanzato - 180°",
    price: PRICE_180,
    degree: 180,
    platforms: ["instagram", "facebook"],
    posts: 4,
    stories: 4,
    contentType: "photos",
    features: [
      "4 post al mese su 2 piattaforme (Instagram, Facebook o LinkedIn)",
      "4 stories al mese",
      "Mix di contenuti grafici e fotografici",
      "Report mensile dettagliato",
      "Strategia di contenuti trimestrale",
    ],
  },
  {
    type: "360",
    name: "Piano Premium - 360°",
    price: PRICE_360,
    degree: 360,
    platforms: ["instagram", "facebook", "linkedin", "tiktok"],
    posts: 8,
    stories: 8,
    contentType: "mix",
    features: [
      "8 post al mese su 3+ piattaforme (Instagram, Facebook, LinkedIn, TikTok)",
      "8 stories al mese",
      "Mix completo di contenuti: grafiche, foto e video",
      "Report settimanale e mensile approfondito",
      "Strategia di contenuti annuale",
      "Gestione commenti e messaggi",
    ],
  },
]

const iconMap = {
  Instagram,
  Facebook,
  Linkedin,
  Music,
  Twitter,
  Youtube,
}

export default function ServiceSelection() {
  const { toast } = useToast()
  const { addService, removeService, services, showVatPrices } = useConfiguratorStore()

  const [selectedPlan, setSelectedPlan] = useState<string>("none")
  const [customPlatforms, setCustomPlatforms] = useState<string[]>(["instagram", "facebook"])
  const [customPosts, setCustomPosts] = useState(4)
  const [customStories, setCustomStories] = useState(4)
  const [customContentType, setCustomContentType] = useState<"graphics" | "photos" | "mix">("photos")
  const [showCustomOptions, setShowCustomOptions] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  // Calcola i costi aggiuntivi delle piattaforme
  const calculatePlatformCosts = (platforms: string[]): { [key: string]: number } => {
    const costs: { [key: string]: number } = {}

    platforms.forEach((platformId) => {
      const platform = platformOptions.find((p) => p.id === platformId)
      if (platform && platform.cost > 0) {
        costs[platformId] = platform.cost
      }
    })

    return costs
  }

  // Calcola il grado del piano personalizzato
  const calculateDegree = (platforms: string[], posts: number, stories: number, contentType: string): number => {
    // Calcolo proporzionale
    const platformFactor = (platforms.length / 3) * PLATFORM_WEIGHT
    const postsFactor = (posts / 8) * POSTS_WEIGHT
    const storiesFactor = (stories / 8) * STORIES_WEIGHT

    // Fattore tipo contenuto
    let contentTypeFactor = 0
    if (contentType === "graphics") contentTypeFactor = 0.5 * CONTENT_TYPE_WEIGHT
    else if (contentType === "photos") contentTypeFactor = 0.75 * CONTENT_TYPE_WEIGHT
    else contentTypeFactor = CONTENT_TYPE_WEIGHT // mix = 100%

    return Math.min(360, platformFactor + postsFactor + storiesFactor + contentTypeFactor)
  }

  // Calcola il prezzo base del piano personalizzato
  const calculateBasePrice = (degree: number): number => {
    let price = 0

    // Interpolazione lineare
    if (degree <= 90) {
      price = (degree / 90) * PRICE_90
    } else if (degree <= 180) {
      price = PRICE_90 + ((degree - 90) / 90) * (PRICE_180 - PRICE_90)
    } else {
      price = PRICE_180 + ((degree - 180) / 180) * (PRICE_360 - PRICE_180)
    }

    // Arrotondamento a multipli di 50
    price = Math.round(price / 50) * 50

    // Prezzo minimo €100
    return Math.max(100, price)
  }

  // Verifica se il piano corrisponde esattamente a uno dei piani predefiniti
  const checkExactPlan = (platforms: string[], posts: number, stories: number, contentType: string): string | null => {
    if (platforms.length === 1 && posts === 2 && stories === 2 && contentType === "graphics") {
      return "90"
    } else if (platforms.length === 2 && posts === 4 && stories === 4 && contentType === "photos") {
      return "180"
    } else if (platforms.length >= 3 && posts === 8 && stories === 8 && contentType === "mix") {
      return "360"
    }
    return null
  }

  // Determina il piano equivalente in base al grado
  const getEquivalentPlan = (degree: number): string => {
    if (degree <= 45) return "Personalizzato"
    if (degree <= 135) return "Piano 90°"
    if (degree <= 270) return "Piano 180°"
    return "Piano 360°"
  }

  // Calcola tutti i dati del piano personalizzato
  const calculateCustomPlan = () => {
    // Calcola il grado
    const degree = calculateDegree(customPlatforms, customPosts, customStories, customContentType)

    // Verifica se corrisponde esattamente a un piano predefinito
    const exactPlan = checkExactPlan(customPlatforms, customPosts, customStories, customContentType)

    // Calcola il prezzo base
    const basePrice = exactPlan
      ? exactPlan === "90"
        ? PRICE_90
        : exactPlan === "180"
          ? PRICE_180
          : PRICE_360
      : calculateBasePrice(degree)

    // Calcola i costi aggiuntivi delle piattaforme
    const platformCosts = calculatePlatformCosts(customPlatforms)

    // Calcola il prezzo totale
    const additionalCost = Object.values(platformCosts).reduce((sum, cost) => sum + cost, 0)
    const totalPrice = basePrice + additionalCost

    // Determina il piano equivalente
    const equivalentPlan = exactPlan
      ? exactPlan === "90"
        ? "Piano 90°"
        : exactPlan === "180"
          ? "Piano 180°"
          : "Piano 360°"
      : getEquivalentPlan(degree)

    return {
      degree,
      basePrice,
      platformCosts,
      totalPrice,
      equivalentPlan,
      exactPlan,
    }
  }

  // Ottieni i dati completi del piano corrente
  const getCurrentPlan = () => {
    if (selectedPlan === "none") {
      return {
        type: "none",
        name: "Nessun Piano",
        platforms: [],
        posts: 0,
        stories: 0,
        contentType: "graphics",
        degree: 0,
        price: 0,
        basePrice: 0,
        platformCosts: {},
        totalPrice: 0,
        equivalentPlan: "Nessun Piano",
      }
    }

    if (selectedPlan === "custom") {
      const { degree, basePrice, platformCosts, totalPrice, equivalentPlan, exactPlan } = calculateCustomPlan()

      return {
        type: exactPlan || "custom",
        name: `Piano personalizzato - ${Math.round(degree)}°`,
        platforms: customPlatforms,
        posts: customPosts,
        stories: customStories,
        contentType: customContentType,
        degree,
        basePrice,
        platformCosts,
        price: showVatPrices ? Math.round(totalPrice * 1.22) : totalPrice,
        totalPrice,
        equivalentPlan,
      }
    }

    const predefined = predefinedPlans.find((p) => p.type === selectedPlan)!
    return {
      type: predefined.type,
      name: predefined.name,
      platforms: predefined.platforms,
      posts: predefined.posts,
      stories: predefined.stories,
      contentType: predefined.contentType,
      degree: predefined.degree,
      basePrice: predefined.price,
      platformCosts: calculatePlatformCosts(predefined.platforms),
      price: showVatPrices ? Math.round(predefined.price * 1.22) : predefined.price,
      totalPrice: predefined.price,
      equivalentPlan: `Piano ${predefined.type}°`,
    }
  }

  // Calcola il piano corrente
  const currentPlan = useMemo(
    () => getCurrentPlan(),
    [selectedPlan, customPlatforms, customPosts, customStories, customContentType, showVatPrices],
  )

  // Gestisce l'aggiunta del piano al preventivo
  const handleAddToPlan = () => {
    if (currentPlan.type === "none") {
      // Check if the service exists before trying to remove it
      const serviceExists = services.some((s) => s.id === "communication_plan")
      if (serviceExists) {
        removeService("communication_plan")
        toast({
          title: "Piano rimosso",
          description: "Nessun piano di comunicazione aggiunto al preventivo",
        })
      }
    } else {
      // Check if the service already exists with the same price
      const existingService = services.find((s) => s.id === "communication_plan")
      if (existingService && existingService.price === currentPlan.price) {
        toast({
          title: "Piano già aggiunto",
          description: `${currentPlan.name} è già presente nel preventivo`,
        })
        return
      }

      addService({
        id: "communication_plan",
        name: currentPlan.name,
        description: `Piano di comunicazione social media - ${currentPlan.equivalentPlan}`,
        price: currentPlan.price,
        type: "monthly",
        details: {
          platforms: currentPlan.platforms,
          posts: currentPlan.posts,
          stories: currentPlan.stories,
          contentType: currentPlan.contentType,
          degree: currentPlan.degree,
        },
      })
      toast({
        title: "Piano aggiunto",
        description: `${currentPlan.name} aggiunto al preventivo`,
      })
    }
  }

  // Imposta i valori predefiniti quando si cambia piano
  useEffect(() => {
    if (selectedPlan === "90") {
      const plan = predefinedPlans.find((p) => p.type === "90")!
      setCustomPlatforms(plan.platforms)
      setCustomPosts(plan.posts)
      setCustomStories(plan.stories)
      setCustomContentType(plan.contentType)
      setShowCustomOptions(false)
    } else if (selectedPlan === "180") {
      const plan = predefinedPlans.find((p) => p.type === "180")!
      setCustomPlatforms(plan.platforms)
      setCustomPosts(plan.posts)
      setCustomStories(plan.stories)
      setCustomContentType(plan.contentType)
      setShowCustomOptions(false)
    } else if (selectedPlan === "360") {
      const plan = predefinedPlans.find((p) => p.type === "360")!
      setCustomPlatforms(plan.platforms)
      setCustomPosts(plan.posts)
      setCustomStories(plan.stories)
      setCustomContentType(plan.contentType)
      setShowCustomOptions(false)
    } else if (selectedPlan === "custom") {
      setShowCustomOptions(true)
    } else {
      setShowCustomOptions(false)
    }
  }, [selectedPlan])

  // Inizializza con il piano corrente se esiste
  useEffect(() => {
    const existingService = services.find((s) => s.id === "communication_plan")
    if (existingService && selectedPlan === "none") {
      const details = existingService.details as any
      if (details) {
        // Determina il tipo di piano
        if (
          details.platforms.length === 1 &&
          details.posts === 2 &&
          details.stories === 2 &&
          details.contentType === "graphics"
        ) {
          setSelectedPlan("90")
        } else if (
          details.platforms.length === 2 &&
          details.posts === 4 &&
          details.stories === 4 &&
          details.contentType === "photos"
        ) {
          setSelectedPlan("180")
        } else if (
          details.platforms.length >= 3 &&
          details.posts === 8 &&
          details.stories === 8 &&
          details.contentType === "mix"
        ) {
          setSelectedPlan("360")
        } else {
          setSelectedPlan("custom")
          setCustomPlatforms(details.platforms || ["instagram", "facebook"])
          setCustomPosts(details.posts || 4)
          setCustomStories(details.stories || 4)
          setCustomContentType(details.contentType || "photos")
        }
      }
    }
  }, [services, selectedPlan])

  // Calcola i costi aggiuntivi delle piattaforme
  const additionalPlatformCosts = Object.entries(currentPlan.platformCosts || {}).reduce(
    (total, [_, cost]) => total + cost,
    0,
  )

  // Gestisce il cambio del valore dello slider dei post
  const handlePostsChange = (value: number[]) => {
    setCustomPosts(value[0])
  }

  // Gestisce il cambio del valore dello slider delle stories
  const handleStoriesChange = (value: number[]) => {
    setCustomStories(value[0])
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Piano di Comunicazione</h2>
        <p className="text-gray-600">Strategia e gestione della comunicazione sui social media</p>
      </div>

      <div className="space-y-6">
        {/* Tipologia Piano */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium">
            <span>Tipologia Piano</span>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-md p-4 cursor-pointer ${selectedPlan === "none" ? "border-[#ff0092]" : "border-gray-200"}`}
                  onClick={() => setSelectedPlan("none")}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                        {selectedPlan === "none" && <div className="h-3 w-3 rounded-full bg-[#ff0092]" />}
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Nessun Piano</h3>
                      <p className="text-sm text-gray-500">Non includere servizi di comunicazione social media</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-md p-4 cursor-pointer ${selectedPlan === "90" ? "border-[#ff0092]" : "border-gray-200"}`}
                  onClick={() => setSelectedPlan("90")}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                        {selectedPlan === "90" && <div className="h-3 w-3 rounded-full bg-[#ff0092]" />}
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Piano Base - 90°</h3>
                      <p className="text-sm text-gray-500">2 post + 2 stories al mese su 1 piattaforma</p>
                      <p className="text-[#ff0092] font-medium mt-1">{PRICE_90} €</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-md p-4 cursor-pointer ${selectedPlan === "180" ? "border-[#ff0092]" : "border-gray-200"}`}
                  onClick={() => setSelectedPlan("180")}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                        {selectedPlan === "180" && <div className="h-3 w-3 rounded-full bg-[#ff0092]" />}
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Piano Avanzato - 180°</h3>
                      <p className="text-sm text-gray-500">4 post + 4 stories al mese su 2 piattaforme</p>
                      <p className="text-[#ff0092] font-medium mt-1">{PRICE_180} €</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-md p-4 cursor-pointer ${selectedPlan === "360" ? "border-[#ff0092]" : "border-gray-200"}`}
                  onClick={() => setSelectedPlan("360")}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                        {selectedPlan === "360" && <div className="h-3 w-3 rounded-full bg-[#ff0092]" />}
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Piano Premium - 360°</h3>
                      <p className="text-sm text-gray-500">8 post + 8 stories al mese su 3+ piattaforme</p>
                      <p className="text-[#ff0092] font-medium mt-1">{PRICE_360} €</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-md p-4 cursor-pointer ${selectedPlan === "custom" ? "border-[#ff0092]" : "border-gray-200"}`}
                  onClick={() => setSelectedPlan("custom")}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                        {selectedPlan === "custom" && <div className="h-3 w-3 rounded-full bg-[#ff0092]" />}
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">Piano Personalizzato</h3>
                      <p className="text-sm text-gray-500">Configura il piano in base alle tue esigenze</p>
                      {selectedPlan === "custom" && currentPlan.price > 0 && (
                        <p className="text-[#ff0092] font-medium mt-1">{currentPlan.price} €</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Opzioni Piano Personalizzato */}
        {showCustomOptions && (
          <Card className="mt-4">
            <CardContent className="pt-6 space-y-6">
              {/* Platforms */}
              <div>
                <Label className="text-base font-semibold">Piattaforme</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {platformOptions.map((platform) => {
                    const IconComponent = iconMap[platform.icon as keyof typeof iconMap]
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
                              } else {
                                toast({
                                  title: "Attenzione",
                                  description: "Devi selezionare almeno una piattaforma",
                                  variant: "destructive",
                                })
                              }
                            }
                          }}
                          className="data-[state=checked]:bg-[#ff0092] data-[state=checked]:border-[#ff0092]"
                        />
                        <Label htmlFor={platform.id} className="flex items-center gap-2 cursor-pointer">
                          <IconComponent className="h-4 w-4" />
                          {platform.name}
                          {platform.cost > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {platform.included ? "Incluso" : `+€${platform.cost}/mese`}
                            </Badge>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Posts */}
              <div>
                <Label className="text-base font-semibold">
                  Numero di post al mese: <span className="numeric-value text-[#ff0092]">{customPosts}</span>
                </Label>
                <Slider
                  value={[customPosts]}
                  onValueChange={handlePostsChange}
                  max={12}
                  min={1}
                  step={1}
                  className="mt-3 slider-custom"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>6</span>
                  <span>12</span>
                </div>
              </div>

              {/* Stories */}
              <div>
                <Label className="text-base font-semibold">
                  Numero di stories al mese: <span className="numeric-value text-[#ff0092]">{customStories}</span>
                </Label>
                <Slider
                  value={[customStories]}
                  onValueChange={handleStoriesChange}
                  max={30}
                  min={1}
                  step={1}
                  className="mt-3 slider-custom"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>15</span>
                  <span>30</span>
                </div>
              </div>

              {/* Content Type */}
              <div>
                <Label className="text-base font-semibold">Tipologia di contenuti</Label>
                <RadioGroup
                  value={customContentType}
                  onValueChange={(value: "graphics" | "photos" | "mix") => setCustomContentType(value)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="graphics" id="graphics" className="border-[#ff0092] text-[#ff0092]" />
                    <Label htmlFor="graphics">Solo grafiche</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="photos" id="photos" className="border-[#ff0092] text-[#ff0092]" />
                    <Label htmlFor="photos">Foto e grafiche</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mix" id="mix" className="border-[#ff0092] text-[#ff0092]" />
                    <Label htmlFor="mix">Mix foto, video e grafiche</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Piano Equivalente */}
              {currentPlan.degree > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-[#ff0092]" />
                    <h4 className="font-semibold">Dettagli Piano</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Grado:</span>{" "}
                      <span className="font-medium">{Math.round(currentPlan.degree)}°</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Equivalente:</span>{" "}
                      <span className="font-medium">{currentPlan.equivalentPlan}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Prezzo base:</span>{" "}
                      <span className="font-medium">€{currentPlan.basePrice}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Extra piattaforme:</span>{" "}
                      <span className="font-medium">€{additionalPlatformCosts}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dettagli Piano Selezionato */}
        {selectedPlan !== "none" && selectedPlan !== "custom" && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Dettagli Piano {selectedPlan}°</h3>
              <ul className="space-y-2">
                {predefinedPlans
                  .find((p) => p.type === selectedPlan)
                  ?.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Pulsante Aggiungi */}
        <div className="mt-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Button
              onClick={handleAddToPlan}
              className="bg-[#ff0092] hover:bg-[#d6007a] text-white px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              {currentPlan.type === "none" ? "Rimuovi dal preventivo" : "Aggiungi al preventivo"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
