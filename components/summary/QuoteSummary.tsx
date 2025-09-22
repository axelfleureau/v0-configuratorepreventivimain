"use client"

import { useConfiguratorStore } from "@/store/configurator-store"
import { formatCurrency } from "@/utils/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export function QuoteSummary() {
  const { services, totals, transport, showVatPrices, paymentPlan, getDiscountRate, packageData, selectedPackage } =
    useConfiguratorStore()

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const discountRate = getDiscountRate()

  // Ensure services is an array
  const serviceArray = Array.isArray(services) ? services : []

  // Group services by category
  const oneTimeServices = serviceArray.filter((s) => s.type === "oneTime" || s.priceOneTime)
  const monthlyServices = serviceArray.filter((s) => s.type === "monthly" || s.priceMonthly)

  // Group by category for better organization
  const oneTimeByCategory = oneTimeServices.reduce(
    (acc, service) => {
      const category = service.category || "other"
      if (!acc[category]) acc[category] = []
      acc[category].push(service)
      return acc
    },
    {} as Record<string, typeof oneTimeServices>,
  )

  const monthlyByCategory = monthlyServices.reduce(
    (acc, service) => {
      const category = service.category || "other"
      if (!acc[category]) acc[category] = []
      acc[category].push(service)
      return acc
    },
    {} as Record<string, typeof monthlyServices>,
  )

  // Calculate subtotals by category
  const oneTimeTotalsByCategory = Object.entries(oneTimeByCategory).reduce(
    (acc, [category, services]) => {
      acc[category] = services.reduce((sum, service) => sum + (service.priceOneTime || 0), 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const monthlyTotalsByCategory = Object.entries(monthlyByCategory).reduce(
    (acc, [category, services]) => {
      acc[category] = services.reduce((sum, service) => sum + (service.priceMonthly || 0), 0)
      return acc
    },
    {} as Record<string, number>,
  )

  // Get communication plan total for discount calculation
  const communicationPlanMonthly = monthlyTotalsByCategory["communication"] || 0
  const communicationDiscount = communicationPlanMonthly * discountRate

  // Calculate totals
  const oneTimeSubtotal =
    Object.values(oneTimeTotalsByCategory).reduce((sum, total) => sum + total, 0) + (transport?.cost || 0)
  const monthlySubtotal =
    Object.values(monthlyTotalsByCategory).reduce((sum, total) => sum + total, 0) - communicationDiscount

  // VAT calculations
  const vatRate = 0.22
  const oneTimeVat = oneTimeSubtotal * vatRate
  const monthlyVat = monthlySubtotal * vatRate

  // Annual calculation
  const annualTotal = oneTimeSubtotal + monthlySubtotal * 12
  const annualTotalWithVat = annualTotal * (1 + vatRate)

  // Category labels mapping
  const categoryLabels: Record<string, string> = {
    website: "Sito Web",
    management: "Gestione Annuale",
    communication: "Piano di Comunicazione",
    photoVideo: "Foto e Video",
    branding: "Branding",
    seo: "SEO",
    advertising: "Advertising",
    crmSige: "CRM/SIGE",
    other: "Altri Servizi",
  }

  // Get package info from store
  const packageInfo =
    packageData ||
    (selectedPackage
      ? {
          id: selectedPackage,
          name: "Pacchetto Personalizzato",
          description: "",
        }
      : null)

  return (
    <div className="space-y-4">
      {/* Package Info */}
      {packageInfo && (
        <Card className="border-[#ff0092]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Pacchetto Selezionato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#ff0092]">{packageInfo.name}</p>
              {packageInfo.id && <p className="text-xs text-gray-500">{packageInfo.id}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* One-time Costs */}
      {oneTimeSubtotal > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Una Tantum</h3>
          <div className="text-2xl font-bold">{formatCurrency(oneTimeSubtotal)}</div>
          <p className="text-xs text-gray-500">Costo iniziale</p>

          {/* Detailed breakdown */}
          <div className="mt-2 space-y-1">
            {Object.entries(oneTimeByCategory).map(([category, services]) => (
              <div key={category} className="text-xs">
                <button
                  onClick={() => toggleCategory(`onetime-${category}`)}
                  className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-1 rounded"
                >
                  <span className="text-gray-600">{categoryLabels[category]}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatCurrency(oneTimeTotalsByCategory[category])}</span>
                    {expandedCategories[`onetime-${category}`] ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </button>
                {expandedCategories[`onetime-${category}`] && (
                  <div className="ml-2 mt-1 space-y-0.5">
                    {services.map((service) => (
                      <div key={service.id} className="flex justify-between text-gray-500">
                        <span className="truncate pr-2">{service.name}</span>
                        <span>{formatCurrency(service.priceOneTime || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {transport && transport.cost > 0 && (
              <div className="text-xs flex justify-between">
                <span className="text-gray-600">Trasporto ({transport.distance} km)</span>
                <span className="font-medium">{formatCurrency(transport.cost)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Monthly Costs */}
      {monthlySubtotal > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Mensile</h3>
          <div className="text-2xl font-bold text-[#ff0092]">
            {formatCurrency(monthlySubtotal)}
            <span className="text-sm font-normal">/mese</span>
          </div>
          <p className="text-xs text-gray-500">Costo ricorrente</p>

          {/* Detailed breakdown */}
          <div className="mt-2 space-y-1">
            {Object.entries(monthlyByCategory).map(([category, services]) => (
              <div key={category} className="text-xs">
                <button
                  onClick={() => toggleCategory(`monthly-${category}`)}
                  className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-1 rounded"
                >
                  <span className="text-gray-600">{categoryLabels[category]}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatCurrency(monthlyTotalsByCategory[category])}/mese</span>
                    {expandedCategories[`monthly-${category}`] ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </button>
                {expandedCategories[`monthly-${category}`] && (
                  <div className="ml-2 mt-1 space-y-0.5">
                    {services.map((service) => (
                      <div key={service.id} className="flex justify-between text-gray-500">
                        <span className="truncate pr-2">{service.name}</span>
                        <span>{formatCurrency(service.priceMonthly || 0)}/mese</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Show discount for communication plan if applicable */}
            {discountRate > 0 && communicationPlanMonthly > 0 && (
              <div className="text-xs flex justify-between text-green-600">
                <span>Sconto Piano Comunicazione (-{discountRate * 100}%)</span>
                <span>-{formatCurrency(communicationDiscount)}/mese</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Annual Total */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Stima Annuale</h3>
        <div className="text-2xl font-bold">{formatCurrency(annualTotal)}</div>
        <p className="text-xs text-gray-500">{formatCurrency(monthlySubtotal)} × 12 mesi</p>
      </div>

      <div className="text-xs text-gray-500 pt-2">IVA 22% da aggiungere ai prezzi mostrati</div>
    </div>
  )
}
