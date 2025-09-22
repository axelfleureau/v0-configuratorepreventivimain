"use client"

import { useState, useEffect } from "react"
import { useConfiguratorStore } from "@/store/configurator-store"
import { PackageSelector } from "@/components/steps/package-selector"
import { ServiceConfigurator } from "@/components/steps/service-configurator"
import { ClientDataForm } from "@/components/steps/client-data-form"
import { QuoteRecap } from "@/components/steps/quote-recap"
import { StepIndicator } from "@/components/step-indicator"
import { PriceSummary } from "@/components/price-summary"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, FileText, User, Settings } from "lucide-react"
import { formatCurrency } from "@/utils/format"
import { useRealTimePackages } from "@/hooks/use-real-time-packages"

const steps = [
  { id: 0, title: "Pacchetto", component: PackageSelector, icon: Settings },
  { id: 1, title: "Servizi", component: ServiceConfigurator, icon: Settings },
  { id: 2, title: "Dati Cliente", component: ClientDataForm, icon: User },
  { id: 3, title: "Riepilogo", component: QuoteRecap, icon: FileText },
]

export function ConfiguratorWrapper() {
  const {
    currentStep,
    setCurrentStep,
    selectedPackage,
    getMonthlyPrice,
    getOneTimePrice,
    paymentPlan,
    selectedServices = [], // Provide default empty array
    showVatPrices,
    setShowVatPrices,
    packageData,
  } = useConfiguratorStore()
  const { isSubscribed } = useRealTimePackages()
  const [mounted, setMounted] = useState(false)

  // For compatibility with the old store structure
  const step = currentStep
  const setStep = setCurrentStep
  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0))

  // Calculate totals
  const monthlyPrice = getMonthlyPrice()
  const oneTimePrice = getOneTimePrice()
  const totals = {
    monthly: monthlyPrice,
    oneTime: oneTimePrice,
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (step > 0) prevStep()
      } else if (e.key === "ArrowRight") {
        if (step < steps.length - 1) nextStep()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [step, steps.length])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const CurrentStep = steps[step]?.component || PackageSelector

  // Group services by category for the summary
  const servicesByCategory = selectedServices.reduce(
    (acc, service) => {
      const category = service.category || "Altro"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(service)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-20">
      {/* Header with title and navigation buttons */}
      <div className="flex justify-between items-center mb-8 mt-16">
        <h2 className="text-2xl font-bold">{steps[step].title}</h2>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 0}
            className="flex items-center bg-white shadow-md hover:bg-gray-50"
            aria-label="Indietro"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">Indietro</span>
          </Button>

          <Button
            onClick={nextStep}
            disabled={step === steps.length - 1}
            className="flex items-center bg-[#ff0092] hover:bg-[#d6007a] text-white shadow-md"
            aria-label="Avanti"
          >
            <span className="mr-2 hidden sm:inline">Avanti</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <StepIndicator currentStep={step} steps={steps} onStepClick={setStep} />
      </div>

      {isSubscribed && (
        <div className="mb-4 text-xs text-green-600 flex items-center">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Connesso in tempo reale
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <CurrentStep />
        </div>

        <div className="lg:w-1/4 space-y-6">
          {/* Riepilogo Costi */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Riepilogo Costi</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="vat-toggle"
                  checked={showVatPrices}
                  onCheckedChange={(checked) => setShowVatPrices(checked)}
                />
                <Label htmlFor="vat-toggle" className="text-sm">
                  {showVatPrices ? "IVA inclusa" : "IVA esclusa"}
                </Label>
              </div>
            </div>

            {/* Mostra info pacchetto selezionato */}
            {(selectedPackage || packageData) && (
              <div className="mb-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <h4 className="font-semibold text-sm text-pink-800 mb-1">Pacchetto Selezionato</h4>
                <p className="text-sm font-medium text-pink-700">{packageData?.name || selectedPackage}</p>
                <div className="mt-2 space-y-1">
                  {oneTimePrice > 0 && (
                    <p className="text-xs text-pink-600">
                      Una tantum: {formatCurrency(showVatPrices ? oneTimePrice * 1.22 : oneTimePrice)}
                    </p>
                  )}
                  {monthlyPrice > 0 && (
                    <p className="text-xs text-pink-600">
                      Mensile: {formatCurrency(showVatPrices ? monthlyPrice * 1.22 : monthlyPrice)}/mese
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Servizi selezionati per categoria */}
            {Object.keys(servicesByCategory).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Servizi Selezionati</h4>
                {Object.entries(servicesByCategory).map(([category, services]) => (
                  <div key={category} className="mb-3">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">{category}</h5>
                    <ul className="text-xs space-y-1 pl-3">
                      {services.map((service) => (
                        <li key={service.id} className="flex justify-between">
                          <span>{service.name}</span>
                          <span className="font-medium">
                            {service.priceMonthly > 0
                              ? `${formatCurrency(
                                  showVatPrices ? service.priceMonthly * 1.22 : service.priceMonthly,
                                )}/mese`
                              : formatCurrency(showVatPrices ? service.priceOneTime * 1.22 : service.priceOneTime)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <PriceSummary
              oneTimePrice={oneTimePrice}
              monthlyPrice={monthlyPrice}
              showVat={showVatPrices}
              paymentPlan={paymentPlan}
            />
          </div>

          {/* Step Navigation */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Navigazione</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" onClick={() => setStep(0)} className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Scegli Pacchetto
                </Button>
                <Button variant="outline" onClick={() => setStep(1)} className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configura Servizi
                </Button>
                <Button variant="outline" onClick={() => setStep(2)} className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Dati Cliente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  disabled={totals.oneTime === 0 && totals.monthly === 0}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Riepilogo Preventivo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm text-xs text-gray-500 px-3 py-1.5 rounded-full shadow-sm border">
        <span className="hidden sm:inline">Usa </span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded mx-1">←</kbd>
        <span className="hidden sm:inline">e</span>
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded mx-1">→</kbd>
        <span className="hidden sm:inline">per navigare</span>
      </div>
    </div>
  )
}
