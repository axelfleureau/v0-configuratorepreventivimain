"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useConfiguratorStore } from "@/store/configurator-store"
import { serviceCategories, serviceOptions } from "@/data/services-data"
import { CommunicationPlanCircle } from "@/components/communication-plan/communication-plan-circle"
import {
  Globe,
  ShoppingCart,
  Search,
  Megaphone,
  BarChart,
  Palette,
  Camera,
  Video,
  Instagram,
  Facebook,
  Linkedin,
  Music,
  Twitter,
  Youtube,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react"

const iconMap = {
  Globe,
  ShoppingCart,
  Search,
  Megaphone,
  BarChart,
  Palette,
  Camera,
  Video,
  Instagram,
  Facebook,
  Linkedin,
  Music,
  Twitter,
  Youtube,
}

export function ServiceConfigurator() {
  const { toast } = useToast()
  const store = useConfiguratorStore()

  // Safely access store properties with fallbacks
  const selectedPackageId = store.selectedPackageId || store.selectedPackage || null
  const services = store.services || store.selectedServices || []
  const showVatPrices = store.showVatPrices || false

  // Safely access store methods with fallbacks
  const addService =
    store.addService ||
    ((service) => {
      console.warn("addService not available, using fallback")
      if (store.toggleService) {
        store.toggleService(service)
      }
    })

  const removeService =
    store.removeService ||
    ((serviceId) => {
      console.warn("removeService not available, using fallback")
      if (store.toggleService) {
        const service = services.find((s) => s.id === serviceId)
        if (service) {
          store.toggleService(service)
        }
      }
    })

  const populatePackageServices =
    store.populatePackageServices ||
    ((packageId) => {
      console.warn("populatePackageServices not available, using fallback")
      if (store.setSelectedPackage) {
        store.setSelectedPackage(packageId)
      }
    })

  const setTransport =
    store.setTransport ||
    ((transport) => {
      console.warn("setTransport not available")
    })

  const [activeTab, setActiveTab] = useState("website")
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({})
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({})
  const [transportDistance, setTransportDistance] = useState(0)

  // Communication plan state
  const [selectedPlan, setSelectedPlan] = useState<"none" | "90" | "180" | "360" | "custom">("custom")
  const [planDegree, setPlanDegree] = useState(84)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"])
  const [postsPerMonth, setPostsPerMonth] = useState([1])
  const [storiesPerMonth, setStoriesPerMonth] = useState([1])
  const [contentType, setContentType] = useState<"graphics" | "photos" | "mix">("mix")
  const [customPlanPrice, setCustomPlanPrice] = useState(300)

  // Website state
  const [websiteSelected, setWebsiteSelected] = useState(false)
  const [hostingSelected, setHostingSelected] = useState(false)

  // Initialize services from selected package
  useEffect(() => {
    if (selectedPackageId && (!Array.isArray(services) || services.length === 0)) {
      populatePackageServices(selectedPackageId)
    }
  }, [selectedPackageId, populatePackageServices, services])

  // Verifica se è stato selezionato un sito web
  useEffect(() => {
    // Ensure services is an array before calling .some()
    const serviceArray = Array.isArray(services) ? services : []

    const hasSiteType = serviceArray.some(
      (s) => s.category === "website" && s.id.startsWith("website-") && s.id !== "website-none",
    )
    setWebsiteSelected(hasSiteType)

    // Verifica se è stato selezionato un hosting
    const hasHosting = serviceArray.some(
      (s) => s.category === "management" && s.id.startsWith("hosting-") && s.id !== "hosting-none",
    )
    setHostingSelected(hasHosting)

    // Se è stato selezionato un sito web ma non un hosting, aggiungi automaticamente l'hosting base
    if (hasSiteType && !hasHosting) {
      const hostingBaseService = serviceOptions.management.find((s) => s.id === "hosting-basic")
      if (hostingBaseService) {
        addService({
          id: hostingBaseService.id,
          name: hostingBaseService.name,
          description: hostingBaseService.description,
          price: hostingBaseService.priceMonthly || 0,
          priceMonthly: hostingBaseService.priceMonthly,
          type: "monthly",
          category: "management",
        })

        // Aggiorna lo stato delle opzioni selezionate
        setSelectedOptions((prev) => ({
          ...prev,
          hosting: "hosting-basic",
        }))

        toast({
          title: "Hosting Base aggiunto",
          description: "L'hosting base è stato aggiunto automaticamente perché necessario per il sito web.",
        })
      }
    }
  }, [services, addService, toast])

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const isSectionOpen = (section: string) => {
    return openSections[section] !== false // Default to open if not set
  }

  const handleOptionSelect = (groupId: string, optionId: string, category: string) => {
    // Update selected option for this group
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }))

    // Remove any previously selected options in this group
    const groupServices = serviceOptions[category as keyof typeof serviceOptions].filter((s) => s.group === groupId)
    groupServices.forEach((service) => {
      removeService(service.id)
    })

    // Also remove services that start with the same prefix for website types
    if (groupId === "website-type") {
      const serviceArray = Array.isArray(services) ? services : []
      serviceArray.forEach((service) => {
        if (service.id.startsWith("website-") && service.id !== optionId) {
          removeService(service.id)
        }
      })
    }

    // For all other sections, ensure only one option is selected per section
    if (groupId !== "website-type") {
      const serviceArray = Array.isArray(services) ? services : []
      serviceArray.forEach((service) => {
        // Check if the service belongs to the same category and section but is not the selected one
        if (service.category === category && service.group === groupId && service.id !== optionId) {
          removeService(service.id)
        }
      })
    }

    // Don't add service if it's a "none" option
    if (optionId.includes("none") || optionId.includes("nessun")) {
      return
    }

    // Find the service in the options
    const service = serviceOptions[category as keyof typeof serviceOptions].find((s) => s.id === optionId)
    if (!service) return

    // Add the service
    addService({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.priceOneTime || service.priceMonthly || 0,
      priceOneTime: service.priceOneTime,
      priceMonthly: service.priceMonthly,
      type: service.priceMonthly ? "monthly" : "oneTime",
      category: category,
      group: groupId, // Aggiungiamo il gruppo al servizio per poterlo identificare più facilmente
    })
  }

  const handleTransportChange = (distance: number) => {
    setTransportDistance(distance)
    const cost = distance * 0.2 * 2 // A/R
    // Update transport cost in store
    setTransport({ distance, cost })
  }

  const handleCommunicationPlanSelect = (plan: "none" | "90" | "180" | "360" | "custom") => {
    if (selectedPlan === plan) return // Prevent unnecessary updates

    setSelectedPlan(plan)

    // Set degree based on plan
    let degree = 0
    switch (plan) {
      case "90":
        degree = 90
        break
      case "180":
        degree = 180
        break
      case "360":
        degree = 360
        break
      case "custom":
        // Calcola il grado in base alle selezioni
        degree = calculatePlanDegree(selectedPlatforms, postsPerMonth[0], storiesPerMonth[0], contentType)
        break
      default:
        degree = 0
    }
    setPlanDegree(degree)

    // Remove existing communication plan
    removeService("communication_plan")

    // Add new plan if not "none"
    if (plan !== "none") {
      const planDetails = {
        "90": {
          name: "Piano Base - 90°",
          description: "2 post + 2 stories al mese su 1 piattaforma",
          price: 300,
        },
        "180": {
          name: "Piano Avanzato - 180°",
          description: "4 post + 4 stories al mese su 2 piattaforme",
          price: 800,
        },
        "360": {
          name: "Piano Premium - 360°",
          description: "8 post + 8 stories al mese su 3+ piattaforme",
          price: 1600,
        },
        custom: {
          name: "Piano Personalizzato",
          description: "Piano di comunicazione personalizzato",
          price: customPlanPrice, // Use calculated price
        },
      }

      const selectedPlanDetails = planDetails[plan]

      addService({
        id: "communication_plan",
        name: selectedPlanDetails.name,
        description: selectedPlanDetails.description,
        price: selectedPlanDetails.price,
        priceMonthly: selectedPlanDetails.price,
        type: "monthly",
        category: "communication",
        details: {
          degree: degree,
          platforms: plan === "custom" ? selectedPlatforms : [],
          posts: plan === "custom" ? postsPerMonth[0] : 0,
          stories: plan === "custom" ? storiesPerMonth[0] : 0,
          contentType: plan === "custom" ? contentType : "mix",
        },
      })
    }
  }

  // Funzione per calcolare il grado del piano personalizzato in base ai parametri
  const calculatePlanDegree = (
    platforms: string[],
    posts: number,
    stories: number,
    contentType: "graphics" | "photos" | "mix",
  ): number => {
    // Calcola il grado in base ai parametri di riferimento dei piani standard

    // Piano Base (90°): 2 post, 2 stories, 1 piattaforma, contenuti grafici
    // Piano Avanzato (180°): 4 post, 4 stories, 2 piattaforme, mix grafico/foto
    // Piano Premium (360°): 8 post, 8 stories, 3+ piattaforme, mix completo

    // Calcolo proporzionale
    let degree = 0

    // Contributo dei post (max 120°)
    const postContribution = Math.min(posts / 8, 1) * 120

    // Contributo delle stories (max 60°)
    const storiesContribution = Math.min(stories / 8, 1) * 60

    // Contributo delle piattaforme (max 120°)
    const platformContribution = Math.min(platforms.length / 3, 1) * 120

    // Contributo del tipo di contenuto (max 60°)
    let contentContribution = 0
    if (contentType === "graphics")
      contentContribution = 20 // Base
    else if (contentType === "photos")
      contentContribution = 40 // Intermedio
    else contentContribution = 60 // Completo

    // Somma tutti i contributi
    degree = postContribution + storiesContribution + platformContribution + contentContribution

    // Arrotonda al multiplo di 5 più vicino
    degree = Math.round(degree / 5) * 5

    // Limita a 360°
    return Math.min(Math.max(degree, 45), 360)
  }

  // Calculate custom plan price based on selections
  useEffect(() => {
    if (selectedPlan !== "custom") return

    // Calcola il grado in base alle selezioni
    const newDegree = calculatePlanDegree(selectedPlatforms, postsPerMonth[0], storiesPerMonth[0], contentType)
    setPlanDegree(newDegree)

    // Calcola il prezzo in base al grado
    let price = 0

    if (newDegree <= 90) {
      // Proporzionale al Piano Base (300€)
      price = Math.max(300, Math.round((newDegree / 90) * 300))
    } else if (newDegree <= 180) {
      // Proporzionale tra Piano Base (300€) e Piano Avanzato (800€)
      const basePrice = 300
      const advancedPrice = 800
      const ratio = (newDegree - 90) / 90
      price = Math.round(basePrice + ratio * (advancedPrice - basePrice))
    } else {
      // Proporzionale tra Piano Avanzato (800€) e Piano Premium (1600€)
      const advancedPrice = 800
      const premiumPrice = 1600
      const ratio = (newDegree - 180) / 180
      price = Math.round(advancedPrice + ratio * (premiumPrice - advancedPrice))
    }

    // Aggiungi costi extra per piattaforme specifiche
    if (selectedPlatforms.includes("linkedin")) price += 100
    if (selectedPlatforms.includes("youtube")) price += 75

    // Arrotonda a multipli di 50
    price = Math.ceil(price / 50) * 50

    setCustomPlanPrice(price)
  }, [selectedPlatforms, postsPerMonth, storiesPerMonth, contentType, selectedPlan])

  // Separate effect for updating the service in the store
  useEffect(() => {
    if (selectedPlan !== "custom") return

    const serviceExists = Array.isArray(services) && services.some((s) => s.id === "communication_plan")

    // Only update if the price has changed to prevent loops
    if (serviceExists) {
      const existingService = services.find((s) => s.id === "communication_plan")
      if (existingService && existingService.price === customPlanPrice) {
        return
      }
    }

    removeService("communication_plan")
    addService({
      id: "communication_plan",
      name: "Piano Personalizzato",
      description: `Piano di comunicazione personalizzato (${planDegree}°)`,
      price: customPlanPrice,
      priceMonthly: customPlanPrice,
      type: "monthly",
      category: "communication",
      details: {
        degree: planDegree,
        platforms: selectedPlatforms,
        posts: postsPerMonth[0],
        stories: storiesPerMonth[0],
        contentType: contentType,
      },
    })
  }, [customPlanPrice, planDegree, selectedPlan, addService, removeService])

  // Safe version of isServiceSelected that handles undefined services
  const isServiceSelected = (serviceId: string) => {
    // Ensure services is an array before calling .some()
    return Array.isArray(services) && services.some((s) => s.id === serviceId)
  }

  const renderCollapsibleSection = (title: string, sectionId: string, children: React.ReactNode) => {
    return (
      <div className="mb-6 border rounded-md overflow-hidden">
        <div
          className="flex items-center justify-between p-4 font-medium cursor-pointer bg-gray-50"
          onClick={() => toggleSection(sectionId)}
        >
          <span>{title}</span>
          {isSectionOpen(sectionId) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {isSectionOpen(sectionId) && <div className="p-4 pt-2">{children}</div>}
      </div>
    )
  }

  const renderRadioOptions = (options: any[], groupId: string, category: string) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          // Assicuriamoci che ogni opzione abbia un gruppo assegnato
          const optionWithGroup = { ...option, group: option.group || groupId }

          const isSelected = selectedOptions[groupId] === optionWithGroup.id || isServiceSelected(optionWithGroup.id)
          const price = optionWithGroup.priceOneTime || optionWithGroup.priceMonthly || 0
          const formattedPrice =
            price === 0
              ? optionWithGroup.id.includes("none") || optionWithGroup.id.includes("nessun")
                ? "0 €"
                : "Incluso"
              : `${price} €${optionWithGroup.priceMonthly ? "/mese" : ""}`

          return (
            <div
              key={optionWithGroup.id}
              className={`border-2 rounded-md p-4 cursor-pointer transition-all ${
                isSelected ? "border-[#ff0092]" : "border-[#E5E7EB]"
              }`}
              onClick={() => handleOptionSelect(groupId, optionWithGroup.id, category)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center">
                    {isSelected && <div className="h-3 w-3 rounded-full bg-[#ff0092]" />}
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{optionWithGroup.name}</h3>
                  <p className="text-sm text-gray-500">{optionWithGroup.description}</p>
                  <p className="text-[#ff0092] font-medium mt-1">{formattedPrice}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderCommunicationPlanSection = () => {
    const planOptions = [
      {
        id: "none",
        name: "Nessun Piano",
        description: "Non includere servizi di comunicazione social media",
        price: 0,
      },
      { id: "90", name: "Piano Base - 90°", description: "2 post + 2 stories al mese su 1 piattaforma", price: 300 },
      {
        id: "180",
        name: "Piano Avanzato - 180°",
        description: "4 post + 4 stories al mese su 2 piattaforme",
        price: 800,
      },
      {
        id: "360",
        name: "Piano Premium - 360°",
        description: "8 post + 8 stories al mese su 3+ piattaforme",
        price: 1600,
      },
      {
        id: "custom",
        name: "Piano Personalizzato",
        description: "Configura il piano in base alle tue esigenze",
        price: customPlanPrice,
      },
    ]

    const planFeatures = {
      "90": [
        "2 post al mese su 1 piattaforma (Instagram o Facebook)",
        "2 stories al mese",
        "Contenuti principalmente grafici",
        "Report mensile base",
      ],
      "180": [
        "4 post al mese su 2 piattaforme (Instagram, Facebook o LinkedIn)",
        "4 stories al mese",
        "Mix di contenuti grafici e fotografici",
        "Report mensile dettagliato",
        "Strategia di contenuti trimestrale",
      ],
      "360": [
        "8 post al mese su 3+ piattaforme (Instagram, Facebook, LinkedIn, TikTok)",
        "8 stories al mese",
        "Mix completo di contenuti: grafiche, foto e video",
        "Report settimanale e mensile approfondito",
        "Strategia di contenuti annuale",
        "Gestione commenti e messaggi",
      ],
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Piano di Comunicazione</h2>
          <p className="text-gray-600">Strategia e gestione della comunicazione sui social media</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Piano di Comunicazione</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {planOptions.map((option) => (
              <button
                key={option.id}
                className={`px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base rounded-md ${
                  selectedPlan === option.id ? "bg-[#ff0092] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleCommunicationPlanSelect(option.id as any)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {selectedPlan === "custom" ? (
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                  <CommunicationPlanCircle degree={planDegree} size={160} className="mx-auto sm:hidden" />
                  <CommunicationPlanCircle degree={planDegree} size={200} className="mx-auto hidden sm:block" />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Piano personalizzato - {planDegree}°</p>
                  <p className="text-sm text-gray-600">
                    Equivalente a un piano {planDegree <= 90 ? "90°" : planDegree <= 180 ? "180°" : "360°"}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Piattaforme</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platform-instagram"
                          checked={selectedPlatforms.includes("instagram")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, "instagram"])
                            } else if (selectedPlatforms.length > 1) {
                              setSelectedPlatforms(selectedPlatforms.filter((p) => p !== "instagram"))
                            } else {
                              toast({
                                title: "Attenzione",
                                description: "Devi selezionare almeno una piattaforma",
                                variant: "destructive",
                              })
                            }
                          }}
                        />
                        <Label htmlFor="platform-instagram" className="flex items-center gap-1 cursor-pointer">
                          <Instagram className="h-4 w-4" /> Instagram
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platform-facebook"
                          checked={selectedPlatforms.includes("facebook")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, "facebook"])
                            } else if (selectedPlatforms.length > 1) {
                              setSelectedPlatforms(selectedPlatforms.filter((p) => p !== "facebook"))
                            } else {
                              toast({
                                title: "Attenzione",
                                description: "Devi selezionare almeno una piattaforma",
                                variant: "destructive",
                              })
                            }
                          }}
                        />
                        <Label htmlFor="platform-facebook" className="flex items-center gap-1 cursor-pointer">
                          <Facebook className="h-4 w-4" /> Facebook
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platform-linkedin"
                          checked={selectedPlatforms.includes("linkedin")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, "linkedin"])
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter((p) => p !== "linkedin"))
                            }
                          }}
                        />
                        <Label htmlFor="platform-linkedin" className="flex items-center gap-1 cursor-pointer">
                          <Linkedin className="h-4 w-4" /> LinkedIn
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platform-tiktok"
                          checked={selectedPlatforms.includes("tiktok")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, "tiktok"])
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter((p) => p !== "tiktok"))
                            }
                          }}
                        />
                        <Label htmlFor="platform-tiktok" className="flex items-center gap-1 cursor-pointer">
                          <Music className="h-4 w-4" /> TikTok
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platform-twitter"
                          checked={selectedPlatforms.includes("twitter")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, "twitter"])
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter((p) => p !== "twitter"))
                            }
                          }}
                        />
                        <Label htmlFor="platform-twitter" className="flex items-center gap-1 cursor-pointer">
                          <Twitter className="h-4 w-4" /> Twitter
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platform-youtube"
                          checked={selectedPlatforms.includes("youtube")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, "youtube"])
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter((p) => p !== "youtube"))
                            }
                          }}
                        />
                        <Label htmlFor="platform-youtube" className="flex items-center gap-1 cursor-pointer">
                          <Youtube className="h-4 w-4" /> YouTube
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">
                      Numero di post al mese: <span className="text-[#ff0092]">{postsPerMonth[0]}</span>
                    </h3>
                    <Slider
                      value={postsPerMonth}
                      onValueChange={setPostsPerMonth}
                      max={12}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>3</span>
                      <span>6</span>
                      <span>9</span>
                      <span>12</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">
                      Numero di stories al mese: <span className="text-[#ff0092]">{storiesPerMonth[0]}</span>
                    </h3>
                    <Slider
                      value={storiesPerMonth}
                      onValueChange={setStoriesPerMonth}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>8</span>
                      <span>15</span>
                      <span>22</span>
                      <span>30</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Tipologia di contenuti</h3>
                    <RadioGroup
                      value={contentType}
                      onValueChange={(value) => setContentType(value as "graphics" | "photos" | "mix")}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="graphics" id="content-graphics" />
                        <Label htmlFor="content-graphics">Solo grafiche</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="photos" id="content-photos" />
                        <Label htmlFor="content-photos">Foto e grafiche</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mix" id="content-mix" />
                        <Label htmlFor="content-mix">Mix foto, video e grafiche</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <h3 className="font-bold">Piano personalizzato</h3>
                      <p className="text-sm text-gray-600">Equivalente a un piano da {planDegree}°</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-[#ff0092]">
                        {customPlanPrice} €<span className="text-sm font-normal">/mese</span>
                      </p>
                      <p className="text-xs text-gray-500">IVA esclusa</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCommunicationPlanSelect("custom")}
                    className="w-full bg-[#ff0092] hover:bg-[#d6007a] text-white"
                  >
                    Aggiungi al preventivo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          selectedPlan !== "none" && (
            <div className="flex flex-col md:flex-row gap-8 bg-gray-50 p-4 sm:p-6 rounded-lg border">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                  <CommunicationPlanCircle
                    degree={selectedPlan === "90" ? 90 : selectedPlan === "180" ? 180 : 360}
                    size={160}
                    className="mx-auto sm:hidden"
                  />
                  <CommunicationPlanCircle
                    degree={selectedPlan === "90" ? 90 : selectedPlan === "180" ? 180 : 360}
                    size={200}
                    className="mx-auto hidden sm:block"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-bold text-lg">
                    {selectedPlan === "90" ? "Piano Base" : selectedPlan === "180" ? "Piano Avanzato" : "Piano Premium"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPlan === "90"
                      ? "Ideale per piccole attività"
                      : selectedPlan === "180"
                        ? "Perfetto per aziende in crescita"
                        : "Soluzione completa per massimizzare la presenza"}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <h3 className="font-semibold mb-3">
                  {selectedPlan === "90"
                    ? "Piano Base - 90°"
                    : selectedPlan === "180"
                      ? "Piano Avanzato - 180°"
                      : "Piano Premium - 360°"}
                </h3>
                <ul className="space-y-2">
                  {planFeatures[selectedPlan as keyof typeof planFeatures]?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div>
                    <h3 className="font-bold">
                      {selectedPlan === "90"
                        ? "Piano Base"
                        : selectedPlan === "180"
                          ? "Piano Avanzato"
                          : "Piano Premium"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[#ff0092]">
                      {selectedPlan === "90" ? "300" : selectedPlan === "180" ? "800" : "1.600"} €
                      <span className="text-sm font-normal">/mese</span>
                    </p>
                    <p className="text-xs text-gray-500">IVA esclusa</p>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {renderCollapsibleSection(
          "Contenuti Iniziali",
          "contenuti-iniziali",
          renderRadioOptions(
            [
              {
                id: "content-0",
                name: "Nessun contenuto iniziale",
                description: "Partiamo da zero",
                priceOneTime: 0,
              },
              {
                id: "content-5",
                name: "5 contenuti iniziali",
                description: "5 contenuti per partire",
                priceOneTime: 1500,
              },
              {
                id: "content-10",
                name: "10 contenuti iniziali",
                description: "10 contenuti per partire",
                priceOneTime: 2500,
              },
              {
                id: "content-15",
                name: "15 contenuti iniziali",
                description: "15 contenuti per partire",
                priceOneTime: 3500,
              },
            ],
            "contenuti-iniziali",
            "communication",
          ),
        )}

        {renderCollapsibleSection(
          "Frequenza delle Uscite",
          "frequenza",
          renderRadioOptions(
            [
              {
                id: "frequency-1-2",
                name: "1-2 uscite/settimana",
                description: "Frequenza standard",
                priceMonthly: 0,
              },
              {
                id: "frequency-3-4",
                name: "3-4 uscite/settimana",
                description: "Frequenza elevata",
                priceMonthly: 300,
              },
            ],
            "frequenza",
            "communication",
          ),
        )}
      </div>
    )
  }

  const renderManagementSection = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Gestione Annuale</h2>
          <p className="text-gray-600">Gestione e manutenzione annuale del sito web</p>
        </div>

        {renderCollapsibleSection(
          "Hosting e Dominio",
          "hosting-dominio",
          <>
            {renderRadioOptions(
              [
                {
                  id: "hosting-none",
                  name: "Nessun Hosting",
                  description: "Gestito dal cliente",
                  priceMonthly: 0,
                },
                {
                  id: "hosting-basic",
                  name: "Hosting Base",
                  description: "Hosting condiviso con spazio e traffico limitati",
                  priceMonthly: 25,
                },
                {
                  id: "hosting-business",
                  name: "Hosting Business",
                  description: "Hosting ottimizzato per siti web aziendali con traffico medio",
                  priceMonthly: 50,
                },
                {
                  id: "hosting-premium",
                  name: "Hosting Premium",
                  description: "Hosting ad alte prestazioni per siti web con traffico elevato",
                  priceMonthly: 100,
                },
              ],
              "hosting",
              "management",
            )}
            {websiteSelected && !hostingSelected && (
              <div className="mt-4 bg-yellow-50 p-3 rounded-md text-sm border border-yellow-200">
                <p className="text-yellow-700">
                  <strong>Nota:</strong> Se hai selezionato un sito web, è necessario includere almeno l'hosting base.
                </p>
              </div>
            )}
          </>,
        )}

        {renderCollapsibleSection(
          "Manutenzione Tecnica",
          "manutenzione",
          renderRadioOptions(
            [
              {
                id: "maintenance-none",
                name: "Nessuna Manutenzione",
                description: "Nessun servizio di manutenzione tecnica",
                priceMonthly: 0,
              },
              {
                id: "maintenance-basic",
                name: "Manutenzione Base",
                description: "Aggiornamenti di sicurezza e backup mensili",
                priceMonthly: 150,
              },
              {
                id: "maintenance-premium",
                name: "Manutenzione Premium",
                description: "Aggiornamenti di sicurezza, backup settimanali e supporto prioritario",
                priceMonthly: 250,
              },
              {
                id: "maintenance-package",
                name: "Pacchetto 10 interventi",
                description: "10 interventi tecnici da utilizzare entro un anno",
                priceOneTime: 400,
              },
            ],
            "manutenzione",
            "management",
          ),
        )}

        {renderCollapsibleSection(
          "Aggiornamento Contenuti",
          "aggiornamento-contenuti",
          <>
            {renderRadioOptions(
              [
                {
                  id: "content-update-none",
                  name: "Nessun Aggiornamento",
                  description: "Nessun servizio di aggiornamento contenuti",
                  priceMonthly: 0,
                },
                {
                  id: "content-update-basic",
                  name: "Aggiornamento Base",
                  description: "Fino a 2-3 aggiornamenti mensili di testi e immagini",
                  priceMonthly: 170,
                },
                {
                  id: "content-update-premium",
                  name: "Aggiornamento Premium",
                  description: "Aggiornamenti illimitati di testi, immagini e sezioni",
                  priceMonthly: 300,
                },
                {
                  id: "content-update-quarterly",
                  name: "Aggiornamento Trimestrale",
                  description: "Aggiornamenti trimestrali programmati",
                  priceMonthly: 40,
                },
              ],
              "aggiornamento-contenuti",
              "management",
            )}
            <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm">
              <p className="text-gray-700">
                <strong>Nota:</strong> L'aggiornamento trimestrale (€40/mese) permette di spalmare il costo su un
                periodo più ampio con interventi meno frequenti.
              </p>
            </div>
          </>,
        )}
      </div>
    )
  }

  const renderPhotoVideoSection = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Foto e Video</h2>
          <p className="text-gray-600">Produzione di contenuti foto e video</p>
        </div>

        {renderCollapsibleSection(
          "Video Principale",
          "video-principale",
          renderRadioOptions(
            [
              { id: "video-none", name: "Nessun video", description: "Non richiedo video principale", priceOneTime: 0 },
              {
                id: "video-base",
                name: "Video Base",
                description: "Video 30-45 secondi con riprese e montaggio semplice",
                priceOneTime: 700,
              },
              {
                id: "video-premium",
                name: "Video Premium",
                description: "Video 45-60 secondi con riprese professionali",
                priceOneTime: 1200,
              },
              {
                id: "video-promo",
                name: "Video Promozionale",
                description: "Video promozionale per nuovi clienti",
                priceOneTime: 299,
              },
            ],
            "video-principale",
            "photoVideo",
          ),
        )}

        {renderCollapsibleSection(
          "Shooting Fotografico",
          "shooting",
          renderRadioOptions(
            [
              {
                id: "shooting-none",
                name: "Nessuno shooting",
                description: "Non richiedo servizio fotografico",
                priceOneTime: 0,
              },
              {
                id: "shooting-base",
                name: "Shooting Base",
                description: "10-15 scatti professionali",
                priceOneTime: 250,
              },
              {
                id: "shooting-premium",
                name: "Shooting Premium",
                description: "20-30 scatti professionali",
                priceOneTime: 500,
              },
            ],
            "shooting",
            "photoVideo",
          ),
        )}

        {renderCollapsibleSection(
          "Pacchetto Video",
          "pacchetto-video",
          renderRadioOptions(
            [
              {
                id: "video-pack-none",
                name: "Nessun pacchetto",
                description: "Non richiedo pacchetti video",
                priceOneTime: 0,
              },
              {
                id: "video-pack-5",
                name: "Pacchetto 5 video",
                description: "Serie di 5 video professionali",
                priceOneTime: 700,
              },
              {
                id: "video-pack-10",
                name: "Pacchetto 10 video",
                description: "Serie di 10 video professionali",
                priceOneTime: 1100,
              },
            ],
            "pacchetto-video",
            "photoVideo",
          ),
        )}

        {renderCollapsibleSection(
          "Riprese con Drone",
          "drone",
          renderRadioOptions(
            [
              { id: "drone-none", name: "Senza Drone", description: "Nessuna ripresa con drone", priceOneTime: 0 },
              {
                id: "drone",
                name: "Con Drone",
                description: "Aggiungi riprese aeree (+35% sul totale video)",
                percentageIncrease: 35,
                priceOneTime: 0,
              },
            ],
            "drone",
            "photoVideo",
          ),
        )}

        {renderCollapsibleSection(
          "Video Social",
          "video-social",
          renderRadioOptions(
            [
              {
                id: "social-video-none",
                name: "Nessun video social",
                description: "Non richiedo video per social",
                priceOneTime: 0,
              },
              {
                id: "social-video-5",
                name: "5 video social",
                description: "5 video brevi per social media",
                priceOneTime: 600,
              },
              {
                id: "social-video-10",
                name: "10 video social",
                description: "10 video brevi per social media",
                priceOneTime: 900,
              },
            ],
            "video-social",
            "photoVideo",
          ),
        )}

        {renderCollapsibleSection(
          "Clip Aggiuntive",
          "extra-clips",
          renderRadioOptions(
            [
              {
                id: "extra-clips-none",
                name: "Nessuna clip aggiuntiva",
                description: "Non richiedo clip extra",
                priceOneTime: 0,
              },
              {
                id: "extra-clips",
                name: "Clip Aggiuntive",
                description: "Clip extra derivate dai video (+15%)",
                percentageIncrease: 15,
                priceOneTime: 0,
              },
            ],
            "extra-clips",
            "photoVideo",
          ),
        )}

        {renderCollapsibleSection(
          "Copertura Eventi",
          "eventi",
          renderRadioOptions(
            [
              {
                id: "event-none",
                name: "Nessuna copertura",
                description: "Non richiedo copertura eventi",
                priceOneTime: 0,
              },
              { id: "event-base", name: "Evento Base (3h)", description: "Copertura fino a 3 ore", priceOneTime: 300 },
              {
                id: "event-1day",
                name: "Evento 1 giorno",
                description: "Copertura giornata intera",
                priceOneTime: 800,
              },
              { id: "event-2days", name: "Evento 2 giorni", description: "Copertura due giorni", priceOneTime: 1600 },
            ],
            "eventi",
            "photoVideo",
          ),
        )}

        {renderCollapsibleSection(
          "Sconto Portfolio",
          "sconti",
          <>
            {renderRadioOptions(
              [
                {
                  id: "portfolio-discount-none",
                  name: "Nessuno sconto",
                  description: "Non autorizzo uso promozionale",
                  priceOneTime: 0,
                },
                {
                  id: "portfolio-discount",
                  name: "Sconto Portfolio",
                  description: "Autorizzo uso promozionale (-50% su video)",
                  discountPercentage: 50,
                  priceOneTime: 0,
                },
              ],
              "sconti",
              "photoVideo",
            )}
            <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm">
              <p className="text-gray-700">
                <strong>Nota:</strong> Autorizzando Righello a utilizzare i video prodotti a scopo promozionale (con
                logo Righello), ottieni uno sconto del 50% sui servizi video.
              </p>
            </div>
          </>,
        )}

        {/* Transport cost */}
        <div className="border rounded-md p-4">
          <h3 className="font-semibold mb-3">Calcolo trasporto:</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
                Distanza da Pordenone (km):
              </label>
              <Input
                id="distance"
                type="number"
                value={transportDistance}
                onChange={(e) => handleTransportChange(Number(e.target.value))}
                className="w-full sm:w-32"
              />
            </div>
            <div className="mt-2 sm:mt-0">
              <p className="block text-sm font-medium text-gray-700 mb-1">Costo trasporto (A/R):</p>
              <p className="text-[#ff0092] font-medium">{(transportDistance * 0.2 * 2).toFixed(2)} €</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Il costo del trasporto viene calcolato a €0,20/km considerando andata e ritorno da Pordenone.
          </p>
        </div>
      </div>
    )
  }

  const renderWebsiteSection = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Sito Web</h2>
          <p className="text-gray-600">Progettazione e sviluppo del sito web</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Caratteristiche incluse in tutti i nostri siti web:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#ff0092] flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium">Certificato SSL incluso</h4>
                <p className="text-sm text-gray-600">Navigazione sicura con protocollo HTTPS</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#ff0092] flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium">Design responsive</h4>
                <p className="text-sm text-gray-600">Ottimizzato per tutti i dispositivi</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#ff0092] flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium">Ottimizzazione SEO base</h4>
                <p className="text-sm text-gray-600">Struttura ottimizzata per i motori di ricerca</p>
              </div>
            </div>
          </div>
        </div>

        {renderCollapsibleSection(
          "Tipologia Sito",
          "tipologia-sito",
          renderRadioOptions(
            [
              {
                id: "website-none",
                name: "Nessun sito web",
                description: "Non richiedo un sito web",
                priceOneTime: 0,
                group: "website-type",
              },
              {
                id: "website-single",
                name: "Sito Monopagina",
                description: "Sito web con tutte le informazioni in un'unica pagina scorrevole",
                priceOneTime: 1000,
                group: "website-type",
              },
              {
                id: "website-multi",
                name: "Sito Multipagina",
                description: "Sito web completo con più pagine e sezioni organizzate",
                priceOneTime: 2500,
                group: "website-type",
              },
              {
                id: "website-ecommerce",
                name: "E-commerce Base",
                description: "Negozio online con funzionalità essenziali per la vendita dei prodotti",
                priceOneTime: 3500,
                group: "website-type",
              },
              {
                id: "website-ecommerce-advanced",
                name: "E-commerce Avanzato",
                description: "Negozio online completo con funzionalità avanzate e personalizzazioni",
                priceOneTime: 5000,
                group: "website-type",
              },
            ],
            "website-type",
            "website",
          ),
        )}

        {renderCollapsibleSection(
          "Numero di Pagine",
          "numero-pagine",
          renderRadioOptions(
            [
              {
                id: "pages-5",
                name: "Fino a 5 pagine",
                description: "Ideale per siti web di piccole dimensioni",
                priceOneTime: 0,
              },
              {
                id: "pages-10",
                name: "6-10 pagine",
                description: "Adatto per siti web di medie dimensioni",
                priceOneTime: 750,
              },
              {
                id: "pages-15",
                name: "11-15 pagine",
                description: "Perfetto per siti web complessi",
                priceOneTime: 1500,
              },
              {
                id: "pages-20",
                name: "16-20 pagine",
                description: "Ideale per siti web di grandi dimensioni",
                priceOneTime: 2250,
              },
            ],
            "numero-pagine",
            "website",
          ),
        )}

        {renderCollapsibleSection(
          "Lingue Aggiuntive",
          "lingue",
          renderRadioOptions(
            [
              {
                id: "languages-0",
                name: "Solo lingua principale",
                description: "Il sito sarà disponibile solo nella lingua principale",
                priceOneTime: 0,
              },
              {
                id: "languages-1",
                name: "1 lingua aggiuntiva",
                description: "Il sito sarà disponibile in 2 lingue",
                priceOneTime: 300,
              },
              {
                id: "languages-2",
                name: "2 lingue aggiuntive",
                description: "Il sito sarà disponibile in 3 lingue",
                priceOneTime: 600,
              },
              {
                id: "languages-3",
                name: "3 lingue aggiuntive",
                description: "Il sito sarà disponibile in 4 lingue",
                priceOneTime: 900,
              },
            ],
            "lingue",
            "website",
          ),
        )}

        {renderCollapsibleSection(
          "Funzionalità Aggiuntive",
          "funzionalita",
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gallery-pdf"
                checked={isServiceSelected("gallery-pdf")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addService({
                      id: "gallery-pdf",
                      name: "Galleria PDF",
                      description: "Sistema per caricare e visualizzare documenti PDF",
                      price: 300,
                      priceOneTime: 300,
                      type: "oneTime",
                      category: "website",
                    })
                  } else {
                    removeService("gallery-pdf")
                  }
                }}
              />
              <div>
                <label htmlFor="gallery-pdf" className="font-medium cursor-pointer">
                  Galleria PDF
                </label>
                <p className="text-sm text-gray-600">Sistema per caricare e visualizzare documenti PDF</p>
                <p className="text-[#ff0092] font-medium">300 €</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="blog"
                checked={isServiceSelected("blog")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addService({
                      id: "blog",
                      name: "Blog",
                      description: "Sezione blog per pubblicare articoli e novità",
                      price: 500,
                      priceOneTime: 500,
                      type: "oneTime",
                      category: "website",
                    })
                  } else {
                    removeService("blog")
                  }
                }}
              />
              <div>
                <label htmlFor="blog" className="font-medium cursor-pointer">
                  Blog
                </label>
                <p className="text-sm text-gray-600">Sezione blog per pubblicare articoli e novità</p>
                <p className="text-[#ff0092] font-medium">500 €</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="area-login"
                checked={isServiceSelected("area-login")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addService({
                      id: "area-login",
                      name: "Area Riservata",
                      description: "Area login per clienti o utenti registrati",
                      price: 800,
                      priceOneTime: 800,
                      type: "oneTime",
                      category: "website",
                    })
                  } else {
                    removeService("area-login")
                  }
                }}
              />
              <div>
                <label htmlFor="area-login" className="font-medium cursor-pointer">
                  Area Riservata
                </label>
                <p className="text-sm text-gray-600">Area login per clienti o utenti registrati</p>
                <p className="text-[#ff0092] font-medium">800 €</p>
              </div>
            </div>
          </div>,
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Categorie come blocchi indipendenti */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Categorie di Servizi</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {serviceCategories.map((category) => {
            const Icon = category.icon ? iconMap[category.icon as keyof typeof iconMap] : null
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  activeTab === category.id ? "border-[#ff0092] bg-pink-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {Icon && <Icon className="h-6 w-6 mb-2" />}
                <span className="text-sm font-medium text-center">{category.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenuto delle tab */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="website">{renderWebsiteSection()}</TabsContent>
        <TabsContent value="management">{renderManagementSection()}</TabsContent>
        <TabsContent value="communication">{renderCommunicationPlanSection()}</TabsContent>
        <TabsContent value="photoVideo">{renderPhotoVideoSection()}</TabsContent>

        {/* Altri tab */}
        {serviceCategories
          .filter((cat) => !["website", "management", "communication", "photoVideo"].includes(cat.id))
          .map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                <p className="text-gray-600">Servizi di {category.name.toLowerCase()}</p>
              </div>

              {/* Render dynamic sections based on groups */}
              {Object.entries(
                serviceOptions[category.id as keyof typeof serviceOptions].reduce((acc: any, service) => {
                  const group = service.group || "default"
                  if (!acc[group]) acc[group] = []
                  acc[group].push(service)
                  return acc
                }, {}),
              ).map(([groupId, services]: [string, any]) =>
                renderCollapsibleSection(
                  groupId === "default"
                    ? category.name
                    : groupId
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" "),
                  `${category.id}-${groupId}`,
                  renderRadioOptions(services, groupId, category.id),
                ),
              )}
            </TabsContent>
          ))}
      </Tabs>
    </div>
  )
}
