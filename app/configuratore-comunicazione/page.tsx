"use client"

import { useState } from "react"
import { Toaster } from "@/components/ui/toaster"
import { CommunicationPlanConfigurator } from "@/components/communication-plan/communication-plan-configurator"
import { ServiceCategoryExplanation } from "@/components/communication-plan/service-category-explanation"
import { CostCounter } from "@/components/communication-plan/cost-counter"
import { DetailedCostBreakdown } from "@/components/communication-plan/detailed-cost-breakdown"
import type { CommunicationPlanData } from "@/types/communication-plan"

export default function ConfiguratorePage() {
  const [includeVAT, setIncludeVAT] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<CommunicationPlanData | null>(null)

  // Calcola i costi totali
  const totalOneTime = selectedPlan?.type === "custom" ? 500 : 0
  const totalMonthly = selectedPlan?.price || 0

  // Crea gli elementi di costo per il breakdown
  const costItems = selectedPlan
    ? [
        {
          category: "social",
          name: "Piano Comunicazione",
          oneTimeCost: totalOneTime,
          monthlyCost: selectedPlan.basePrice,
          color: "#ff0092",
        },
        // Aggiungi costi piattaforme aggiuntive se presenti
        ...Object.entries(selectedPlan.platformCosts || {}).map(([platformId, cost]) => ({
          category: "social",
          name: `Extra: ${platformId.charAt(0).toUpperCase() + platformId.slice(1)}`,
          oneTimeCost: 0,
          monthlyCost: cost,
          color: "#9c27b0",
        })),
      ]
    : []

  const handlePlanSelected = (plan: CommunicationPlanData) => {
    setSelectedPlan(plan)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Configuratore Piano di Comunicazione</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Crea il piano di comunicazione social media perfetto per la tua azienda. Scegli tra i nostri piani
            predefiniti o personalizza la tua strategia.
          </p>
        </div>

        <ServiceCategoryExplanation />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Configurator */}
          <div className="lg:col-span-3">
            <CommunicationPlanConfigurator onPlanSelected={handlePlanSelected} includeVAT={includeVAT} />
          </div>

          {/* Sidebar with costs */}
          <div className="lg:col-span-1 space-y-6">
            <CostCounter
              oneTimeCost={totalOneTime}
              monthlyCost={totalMonthly}
              includeVAT={includeVAT}
              onVATToggle={setIncludeVAT}
            />

            {selectedPlan && selectedPlan.type !== "none" && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Piano Selezionato</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-medium">
                        {selectedPlan.type === "custom" ? "Personalizzato" : `Piano ${selectedPlan.type}°`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Piattaforme:</span>
                      <span className="font-medium">{selectedPlan.platforms.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Post/mese:</span>
                      <span className="font-medium">{selectedPlan.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stories/mese:</span>
                      <span className="font-medium">{selectedPlan.stories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grado:</span>
                      <span className="font-medium text-[#ff0092]">{Math.round(selectedPlan.degree)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equivalente:</span>
                      <span className="font-medium">{selectedPlan.equivalentPlan}</span>
                    </div>
                  </div>
                </div>

                <DetailedCostBreakdown costItems={costItems} includeVAT={includeVAT} />
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Legenda Costi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>
                <strong>Costi Una Tantum:</strong> Setup iniziale, configurazioni, sviluppo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>
                <strong>Costi Mensili:</strong> Gestione, manutenzione, servizi ricorrenti
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
            <p>
              <strong>Nota:</strong> I prezzi sono indicativi e possono variare in base alle specifiche esigenze del
              progetto. Tutti i piani includono consulenza strategica e supporto tecnico.
            </p>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
