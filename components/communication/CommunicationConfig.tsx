"use client"

import { useState, useEffect } from "react"
import { useConfiguratorStore } from "@/store/configurator-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CommunicationPlanCircle } from "@/components/communication-plan/communication-plan-circle"

// Definizione dei moltiplicatori per i vari tier
const TIER_MULTIPLIERS = {
  "90": 1,
  "150": 1.4,
  "180": 1.7,
  "360": 2.2,
}

// Costi unitari
const VIDEO_UNIT_COST = 100
const PHOTO_UNIT_RATIO = 0.25

export function CommunicationConfig() {
  const { services, addService, removeService, showVatPrices, selectedPackageId } = useConfiguratorStore()

  const [selectedTier, setSelectedTier] = useState<"90" | "150" | "180" | "360">("150")
  const [monthlyVideos, setMonthlyVideos] = useState(3)
  const [monthlyPhotos, setMonthlyPhotos] = useState(6) // Automaticamente videos * 2

  // Controlla se un piano di comunicazione è già selezionato
  useEffect(() => {
    const communicationServices = services.filter((s) => s.category === "communication")
    if (communicationServices.length > 0) {
      const planService = communicationServices.find((s) => s.id.includes("plan-"))
      if (planService) {
        if (planService.id === "plan-90") setSelectedTier("90")
        else if (planService.id === "plan-180") setSelectedTier("180")
        else if (planService.id === "plan-360") setSelectedTier("360")
        else if (planService.id === "plan-custom") {
          // Determina il tier in base al prezzo
          const price = planService.priceMonthly || 0
          if (price <= 300) setSelectedTier("90")
          else if (price <= 500) setSelectedTier("150")
          else if (price <= 800) setSelectedTier("180")
          else setSelectedTier("360")
        }
      }
    }
  }, [services])

  // Aggiorna automaticamente il numero di foto quando cambiano i video
  useEffect(() => {
    setMonthlyPhotos(monthlyVideos * 2)
  }, [monthlyVideos])

  // Calcola il prezzo in base al tier e al numero di contenuti
  const calculatePrice = () => {
    const multiplier = TIER_MULTIPLIERS[selectedTier]
    const totalVideos = monthlyVideos * VIDEO_UNIT_COST * multiplier
    const totalPhotos = monthlyPhotos * VIDEO_UNIT_COST * PHOTO_UNIT_RATIO * multiplier
    return Math.round(totalVideos + totalPhotos)
  }

  // Gestisci il cambio di tier
  const handleTierChange = (tier: "90" | "150" | "180" | "360") => {
    setSelectedTier(tier)

    // Imposta valori predefiniti in base al tier
    switch (tier) {
      case "90":
        setMonthlyVideos(2)
        break
      case "150":
        setMonthlyVideos(3)
        break
      case "180":
        setMonthlyVideos(4)
        break
      case "360":
        setMonthlyVideos(8)
        break
    }

    updateCommunicationPlan(tier)
  }

  // Aggiorna il piano di comunicazione nel configuratore
  const updateCommunicationPlan = (tier = selectedTier) => {
    // Rimuovi eventuali piani esistenti
    services.filter((s) => s.category === "communication" && s.id.includes("plan-")).forEach((s) => removeService(s.id))

    const price = calculatePrice()
    const finalPrice = showVatPrices ? Math.round(price * 1.22) : price

    let planName = "Piano Personalizzato"
    let planId = "plan-custom"

    // Se corrisponde a un piano standard, usa quel nome
    if (tier === "90" && monthlyVideos === 2) {
      planName = "Piano Base - 90°"
      planId = "plan-90"
    } else if (tier === "180" && monthlyVideos === 4) {
      planName = "Piano Avanzato - 180°"
      planId = "plan-180"
    } else if (tier === "360" && monthlyVideos === 8) {
      planName = "Piano Premium - 360°"
      planId = "plan-360"
    }

    addService({
      id: planId,
      name: planName,
      description: `${monthlyVideos} video e ${monthlyPhotos} foto al mese`,
      price: finalPrice,
      priceMonthly: finalPrice,
      type: "monthly",
      category: "communication",
    })
  }

  // Calcola il grado effettivo in base al tier e al numero di contenuti
  const calculateDegree = () => {
    const baseDegreesMap = {
      "90": 90,
      "150": 150,
      "180": 180,
      "360": 360,
    }

    const baseDegree = baseDegreesMap[selectedTier]

    // Aggiusta in base al numero di video rispetto al valore standard per quel tier
    const standardVideos = {
      "90": 2,
      "150": 3,
      "180": 4,
      "360": 8,
    }

    const videoRatio = monthlyVideos / standardVideos[selectedTier]
    return Math.round(baseDegree * videoRatio)
  }

  // Controlla se le selezioni sono disabilitate (pacchetto selezionato)
  const isDisabled = selectedPackageId !== null && selectedPackageId !== "custom"

  // Gestisce il cambio del valore dello slider
  const handleSliderChange = (value: number[]) => {
    setMonthlyVideos(value[0])
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Piano di Comunicazione</h2>
        <p className="text-gray-600">Configura la tua strategia di comunicazione sui social media</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Doughnut chart */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Piano di Comunicazione</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <CommunicationPlanCircle degree={calculateDegree()} size={200} />

              <div className="mt-6 space-y-2 w-full">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#ff0092] mr-2"></div>
                    <span className="text-sm">Video ({monthlyVideos})</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(monthlyVideos * VIDEO_UNIT_COST * TIER_MULTIPLIERS[selectedTier])}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] mr-2"></div>
                    <span className="text-sm">Foto ({monthlyPhotos})</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(
                      monthlyPhotos * VIDEO_UNIT_COST * PHOTO_UNIT_RATIO * TIER_MULTIPLIERS[selectedTier],
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-2xl font-bold text-[#ff0092]">
                  {showVatPrices ? formatCurrency(calculatePrice() * 1.22) : formatCurrency(calculatePrice())}
                  {showVatPrices ? "" : " +IVA"}/mese
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seleziona il Piano</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTier} onValueChange={(v) => handleTierChange(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="90" disabled={isDisabled}>
                    90°
                  </TabsTrigger>
                  <TabsTrigger value="150" disabled={isDisabled}>
                    150°
                  </TabsTrigger>
                  <TabsTrigger value="180" disabled={isDisabled}>
                    180°
                  </TabsTrigger>
                  <TabsTrigger value="360" disabled={isDisabled}>
                    360°
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                  <div>
                    <Label className="text-base font-medium">Video mensili: {monthlyVideos}</Label>
                    <Slider
                      value={[monthlyVideos]}
                      onValueChange={(v) => handleSliderChange(v)}
                      onValueCommit={() => updateCommunicationPlan()}
                      max={8}
                      min={2}
                      step={1}
                      disabled={isDisabled}
                      className="mt-3"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>2</span>
                      <span>5</span>
                      <span>8</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Foto mensili: {monthlyPhotos}</Label>
                    <div className="text-xs text-gray-500 mt-1">Automaticamente calcolate come il doppio dei video</div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => updateCommunicationPlan()}
                      disabled={isDisabled}
                      className="bg-[#ff0092] hover:bg-[#d6007a] text-white"
                    >
                      Aggiorna Piano
                    </Button>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Funzione di formattazione valuta
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
