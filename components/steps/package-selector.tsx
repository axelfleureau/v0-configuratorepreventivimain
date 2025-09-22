"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useConfiguratorStore } from "@/store/configurator-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRealTimePackages } from "@/hooks/use-real-time-packages"
import { Skeleton } from "@/components/ui/skeleton"

export function PackageSelector() {
  const { selectedPackage, setSelectedPackage, setCurrentStep, populatePackageServices } = useConfiguratorStore()
  const { packages, isLoading, isRefetching } = useRealTimePackages()
  const [localSelectedPackage, setLocalSelectedPackage] = useState<string | null>(selectedPackage)
  const [packageColors, setPackageColors] = useState<{ [key: string]: string }>({})

  // Fetch package colors from the packages data
  useEffect(() => {
    if (packages && packages.length > 0) {
      const colors: { [key: string]: string } = {}
      packages.forEach((pkg) => {
        if (pkg.border_color) {
          colors[pkg.id] = pkg.border_color
        }
      })
      setPackageColors(colors)
    }
  }, [packages])

  const handlePackageSelect = async (packageId: string) => {
    setLocalSelectedPackage(packageId)
    setSelectedPackage(packageId)

    // Wait for services to be populated
    await populatePackageServices(packageId)

    // Move to service configuration
    setCurrentStep(1)
  }

  const handleCustomSelect = () => {
    setLocalSelectedPackage(null)
    setSelectedPackage(null)
    // Clear selected services for custom package
    useConfiguratorStore.getState().reset()
    useConfiguratorStore.getState().setSelectedPackage(null)
    // Vai direttamente alla configurazione servizi
    setCurrentStep(1)
  }

  const handleContinue = () => {
    setCurrentStep(1) // Move to the next step
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-gray-200">
              <CardHeader>
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {isRefetching && (
        <div className="absolute top-0 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm animate-pulse">
          Aggiornamento pacchetti...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages?.map((pkg) => {
          const packageColor = pkg.border_color || "#ff0092"
          return (
            <Card
              key={pkg.id}
              className={`border cursor-pointer transition-all hover:shadow-md ${
                localSelectedPackage === pkg.id ? "ring-2 ring-opacity-50" : "border-gray-200 hover:border-opacity-70"
              }`}
              style={{
                borderColor: localSelectedPackage === pkg.id ? packageColor : "",
                boxShadow: localSelectedPackage === pkg.id ? `0 0 15px ${packageColor}40` : "",
              }}
              onClick={() => handlePackageSelect(pkg.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = packageColor
                e.currentTarget.style.boxShadow = `0 0 15px ${packageColor}40`
              }}
              onMouseLeave={(e) => {
                if (localSelectedPackage !== pkg.id) {
                  e.currentTarget.style.borderColor = ""
                  e.currentTarget.style.boxShadow = ""
                }
              }}
            >
              <CardHeader>
                <CardTitle>{pkg.nome}</CardTitle>
                <CardDescription>A partire da €{pkg.prezzo.toLocaleString("it-IT")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{pkg.descrizione}</p>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Caratteristiche:</h4>
                  <ul className="text-sm space-y-1">
                    {(() => {
                      // Handle different formats of features data
                      let featuresList = []

                      if (pkg.features) {
                        // If it's a string (JSON), try to parse it
                        if (typeof pkg.features === "string") {
                          try {
                            featuresList = JSON.parse(pkg.features)
                          } catch (e) {
                            // If parsing fails, split by commas or use as single item
                            featuresList = pkg.features.includes(",")
                              ? pkg.features.split(",").map((f) => f.trim())
                              : [pkg.features]
                          }
                        }
                        // If it's already an array
                        else if (Array.isArray(pkg.features)) {
                          featuresList = pkg.features
                        }
                      }

                      return featuresList.length > 0 ? (
                        featuresList.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span style={{ color: packageColor }} className="mr-2">
                              ✓
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start">
                          <span style={{ color: packageColor }} className="mr-2">
                            ✓
                          </span>
                          <span>Pacchetto completo</span>
                        </li>
                      )
                    })()}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full text-white hover:ring-2 hover:ring-opacity-70"
                  style={
                    {
                      backgroundColor: packageColor,
                      "--hover-bg": `${packageColor}dd`,
                      "--hover-ring": packageColor,
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${packageColor}dd`
                    e.currentTarget.style.boxShadow = `0 0 15px ${packageColor}40`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = packageColor
                    e.currentTarget.style.boxShadow = ""
                  }}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  Seleziona
                </Button>
              </CardFooter>
            </Card>
          )
        })}

        <Card
          className={`border cursor-pointer transition-all hover:shadow-md ${
            localSelectedPackage === null
              ? "border-[#ff0092] ring-2 ring-[#ff0092] ring-opacity-50"
              : "border-gray-200 hover:border-[#ff0092]"
          }`}
          onClick={handleCustomSelect}
        >
          <CardHeader>
            <CardTitle>Personalizzato</CardTitle>
            <CardDescription>Crea il tuo pacchetto su misura</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Seleziona i servizi che desideri includere nel tuo pacchetto personalizzato.
            </p>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Vantaggi:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-start">
                  <span className="text-[#ff0092] mr-2">✓</span>
                  <span>Massima flessibilità</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff0092] mr-2">✓</span>
                  <span>Paghi solo ciò che ti serve</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ff0092] mr-2">✓</span>
                  <span>Espandibile in futuro</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-[#ff0092] hover:bg-[#d6007a] hover:ring-2 hover:ring-sky-400/70"
              onClick={handleCustomSelect}
            >
              Personalizza
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
