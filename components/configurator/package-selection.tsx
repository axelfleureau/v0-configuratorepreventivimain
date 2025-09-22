"use client"

import { useState } from "react"
import { useConfiguratorStore } from "@/store/configurator-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"
import { packages } from "@/data/packages"
import type { ServicePackage } from "@/types"

export function PackageSelector() {
  const { packageType, setPackageType, nextStep, showVatPrices, populatePackageServices } = useConfiguratorStore()
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage>(packageType)
  const [loading, setLoading] = useState(false)

  const handleContinue = () => {
    setLoading(true)

    // Set the package type in the store
    setPackageType(selectedPackage)

    // Populate services based on the selected package
    if (selectedPackage !== "custom") {
      populatePackageServices(selectedPackage)
    }

    setLoading(false)
    nextStep()
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Seleziona il Tuo Pacchetto</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Scegli tra i nostri pacchetti preconfigurati o crea una soluzione personalizzata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`rounded-xl cursor-pointer transition-all hover:shadow-lg shadow-[0_0_15px_rgba(0,0,0,0.04)] relative overflow-hidden ${
              selectedPackage === pkg.id ? `border-2` : "border border-gray-200"
            } hover:before:opacity-100 before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:bg-gradient-to-r before:from-transparent before:to-[#ff009220] before:pointer-events-none`}
            style={{
              borderColor: selectedPackage === pkg.id ? pkg.borderColor : "#e5e7eb",
              boxShadow: selectedPackage === pkg.id ? `0 0 15px ${pkg.borderColor}33` : undefined,
            }}
            onClick={() => setSelectedPackage(pkg.id as ServicePackage)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{pkg.label}</CardTitle>
                {selectedPackage === pkg.id && (
                  <div className="rounded-full p-1" style={{ backgroundColor: pkg.borderColor }}>
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {pkg.id !== "custom" && (
                <div className="text-2xl font-bold mb-4">
                  A partire da €
                  {(showVatPrices ? Math.round(pkg.basePrice * 1.22) : pkg.basePrice).toLocaleString("it-IT")}
                  {showVatPrices ? "" : " +IVA"}
                </div>
              )}
              {pkg.id === "custom" ? (
                <p className="text-gray-600">
                  Costruisci la tua soluzione selezionando solo i servizi di cui hai bisogno.
                </p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Servizi inclusi:</p>
                  <ul className="space-y-1">
                    {pkg.highlightedServices.map((service, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{service}</span>
                      </li>
                    ))}
                    {pkg.includedServiceIds.length > pkg.highlightedServices.length && (
                      <li className="text-sm text-gray-500">
                        +{pkg.includedServiceIds.length - pkg.highlightedServices.length} altri servizi
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full transition-all"
                style={{
                  borderColor: selectedPackage === pkg.id ? pkg.borderColor : undefined,
                  color: selectedPackage === pkg.id ? pkg.borderColor : undefined,
                }}
                onClick={() => setSelectedPackage(pkg.id as ServicePackage)}
              >
                {selectedPackage === pkg.id ? "Selezionato" : "Seleziona"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={handleContinue}
          disabled={loading}
          className="bg-[#ff0092] hover:bg-[#d6007a] text-white px-8 py-6 text-lg rounded-full shadow-[0_0_15px_rgba(255,0,146,0.3)] hover:ring-2 hover:ring-sky-400/70"
        >
          {loading ? "Caricamento..." : "Continua alla Configurazione"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
