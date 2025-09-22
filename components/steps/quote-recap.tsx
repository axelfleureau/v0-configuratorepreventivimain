"use client"

import { useEffect, useState } from "react"
import { useConfiguratorStore } from "@/store/configurator-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Check, Save } from "lucide-react"
import type { QuoteData } from "@/types"
import { generatePDF } from "@/utils/pdf-generator-new"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function QuoteRecap() {
  const {
    packageType,
    selectedServices,
    clientData,
    totals,
    prevStep,
    resetConfigurator,
    discounts,
    showVatPrices,
    transport,
    generateQuote,
    packageData,
    paymentPlan,
  } = useConfiguratorStore()

  // Ensure services is always an array
  const safeServices = Array.isArray(selectedServices) ? selectedServices : []

  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [includeVAT, setIncludeVAT] = useState(showVatPrices)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [generatedPdfData, setGeneratedPdfData] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const generatedQuote = generateQuote()
    setQuote(generatedQuote)
  }, [generateQuote])

  useEffect(() => {
    setIncludeVAT(showVatPrices)
  }, [showVatPrices])

  // Auto-close success modal after 4 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (showSuccessModal) {
      timeoutId = setTimeout(() => {
        setShowSuccessModal(false)
      }, 4000)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [showSuccessModal])

  const selectedPackage =
    safeServices && Array.isArray(safeServices)
      ? safeServices.find((service) => service.packageType === packageType)
      : null

  const handleNewQuote = () => {
    resetConfigurator()
  }

  const handleGeneratePDF = async () => {
    if (!quote) return

    try {
      setIsGeneratingPDF(true)
      setError(null)

      console.log("Dati preventivo per PDF:", quote)

      // Prepara i dati del preventivo con IVA
      const quoteDataWithVAT = {
        ...quote,
        includeVAT,
        transportCost: transport?.cost || 0,
        distance: transport?.distance || 0,
        paymentPlan: paymentPlan || "monthly",
        selectedServices: safeServices, // Passa l'array di servizi direttamente
      }

      // Genera il PDF
      const pdfData = await generatePDF(quoteDataWithVAT, false)
      setGeneratedPdfData(pdfData)

      // Mostra il modal di successo
      setShowSuccessModal(true)

      toast({
        title: "PDF generato con successo",
        description: "Il preventivo è stato generato. Clicca su Download per scaricarlo.",
      })
    } catch (error: any) {
      console.error("Errore generazione PDF:", error)
      setError(error.message || "Si è verificato un errore durante la generazione del PDF.")
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione del PDF.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!generatedPdfData) return

    // Create a link element and trigger download
    const linkSource = generatedPdfData
    const downloadLink = document.createElement("a")
    const fileName = `Righello_Preventivo_${quote?.clientData.companyName || "Cliente"}_${quote?.id}.pdf`.replace(
      /[^a-z0-9_\-.]/gi,
      "_",
    )

    downloadLink.href = linkSource
    downloadLink.download = fileName
    downloadLink.click()
  }

  if (!quote) {
    return <div>Loading...</div>
  }

  // Calcolo degli sconti
  const discountedMonthlyTotal = totals.monthly - totals.monthly * (discounts.percentage / 100)
  const periodMonths = discounts.percentage === 10 ? 12 : discounts.percentage === 5 ? 6 : 1
  const periodTotal = discountedMonthlyTotal * periodMonths
  const grandTotal = totals.oneTime + periodTotal

  // Calcolo IVA
  const vatRate = 0.22
  const vatAmount = includeVAT ? totals.oneTime * vatRate : 0
  const displayPrice = includeVAT ? totals.oneTime * (1 + vatRate) : totals.oneTime

  // Group services by category
  const oneTimeServicesByCategory = safeServices
    .filter((service) => service.priceOneTime && service.priceOneTime > 0)
    .reduce(
      (acc, service) => {
        const category = service.category as string
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(service)
        return acc
      },
      {} as Record<string, typeof selectedServices>,
    )

  const monthlyServicesByCategory = safeServices
    .filter((service) => service.priceMonthly && service.priceMonthly > 0)
    .reduce(
      (acc, service) => {
        const category = service.category as string
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(service)
        return acc
      },
      {} as Record<string, typeof selectedServices>,
    )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Riepilogo Preventivo</h1>
        <p className="text-gray-600">
          Preventivo per {clientData.company || "Cliente"} - ID: {quote.id}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Servizi Selezionati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Tipo Pacchetto */}
              {packageData && (
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="font-semibold">Tipo Pacchetto</h3>
                  <span className="text-[#ff0092] font-medium">{packageData.name}</span>
                </div>
              )}

              {/* Servizi Una Tantum */}
              {safeServices.filter((service) => service.priceOneTime && service.priceOneTime > 0).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Servizi Una Tantum</h3>
                  {Object.entries(
                    safeServices
                      .filter((service) => service.priceOneTime && service.priceOneTime > 0)
                      .reduce(
                        (acc, service) => {
                          const category = service.category || "Altri servizi"
                          if (!acc[category]) {
                            acc[category] = []
                          }
                          acc[category].push(service)
                          return acc
                        },
                        {} as Record<string, typeof safeServices>,
                      ),
                  ).map(([category, categoryServices]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-gray-700">{category}</h4>
                      <ul className="space-y-2">
                        {categoryServices.map((service) => (
                          <li key={service.id} className="flex justify-between items-start pl-4">
                            <div className="flex items-start flex-1">
                              <Check className="h-4 w-4 text-[#ff0092] mr-2 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="font-medium">{service.name}</span>
                                {service.description && (
                                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="font-medium ml-4">
                              €{(service.priceOneTime || 0).toLocaleString("it-IT")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Servizi Mensili */}
              {safeServices.filter((service) => service.priceMonthly && service.priceMonthly > 0).length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Servizi Mensili</h3>
                  {Object.entries(
                    safeServices
                      .filter((service) => service.priceMonthly && service.priceMonthly > 0)
                      .reduce(
                        (acc, service) => {
                          const category = service.category || "Altri servizi"
                          if (!acc[category]) {
                            acc[category] = []
                          }
                          acc[category].push(service)
                          return acc
                        },
                        {} as Record<string, typeof safeServices>,
                      ),
                  ).map(([category, categoryServices]) => (
                    <div key={`monthly-${category}`} className="space-y-2">
                      <h4 className="font-medium text-gray-700">{category}</h4>
                      <ul className="space-y-2">
                        {categoryServices.map((service) => (
                          <li key={`monthly-${service.id}`} className="flex justify-between items-start pl-4">
                            <div className="flex items-start flex-1">
                              <Check className="h-4 w-4 text-[#ff0092] mr-2 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="font-medium">{service.name}</span>
                                {service.description && (
                                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="font-medium ml-4">
                              €{(service.priceMonthly || 0).toLocaleString("it-IT")}/mese
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Trasporto */}
              {transport && transport.cost > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Costo Trasporto</h4>
                      <p className="text-sm text-gray-500">Distanza: {transport.distance} km</p>
                    </div>
                    <span className="font-medium">€{transport.cost.toLocaleString("it-IT")}</span>
                  </div>
                </div>
              )}

              {/* Totali */}
              <div className="pt-4 border-t border-dashed space-y-4">
                {/* Riepilogo Totali */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3 text-center">Riepilogo Totali</h3>

                  {/* Totale Una Tantum */}
                  {totals.oneTime > 0 && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Totale Servizi Una Tantum</h3>
                        <span className="font-semibold">€{totals.oneTime.toLocaleString("it-IT")}</span>
                      </div>

                      {/* Trasporto */}
                      {transport && transport.cost > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span>Costo Trasporto ({transport.distance} km)</span>
                          <span>€{transport.cost.toLocaleString("it-IT")}</span>
                        </div>
                      )}

                      {includeVAT && (
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>IVA 22%</span>
                          <span>
                            €
                            {((totals.oneTime + (transport?.cost || 0)) * 0.22).toLocaleString("it-IT", {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <h3 className="font-bold">Totale Complessivo Una Tantum {includeVAT ? "(IVA inclusa)" : ""}</h3>
                        <span className="font-bold text-[#ff0092]">
                          €
                          {((totals.oneTime + (transport?.cost || 0)) * (includeVAT ? 1.22 : 1)).toLocaleString(
                            "it-IT",
                            {
                              maximumFractionDigits: 0,
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Totale Mensile */}
                  {totals.monthly > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Totale Servizi Mensili</h3>
                        <div className="text-right">
                          {paymentPlan === "annual" ? (
                            <>
                              <span className="text-gray-500 line-through">
                                €{totals.monthly.toLocaleString("it-IT")}/mese
                              </span>
                              <span className="font-semibold ml-2">
                                €{(totals.monthly * 0.9).toLocaleString("it-IT", { maximumFractionDigits: 0 })}/mese
                              </span>
                              <div className="text-sm text-[#ff0092]">Sconto 10% (Piano Annuale)</div>
                            </>
                          ) : (
                            <span className="font-semibold">€{totals.monthly.toLocaleString("it-IT")}/mese</span>
                          )}
                        </div>
                      </div>

                      {includeVAT && (
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>IVA 22%</span>
                          <span>
                            €
                            {((paymentPlan === "annual" ? totals.monthly * 0.9 : totals.monthly) * 0.22).toLocaleString(
                              "it-IT",
                              { maximumFractionDigits: 0 },
                            )}
                            /mese
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <h3 className="font-bold">Totale Complessivo Mensile {includeVAT ? "(IVA inclusa)" : ""}</h3>
                        <span className="font-bold text-[#ff0092]">
                          €
                          {(
                            (paymentPlan === "annual" ? totals.monthly * 0.9 : totals.monthly) * (includeVAT ? 1.22 : 1)
                          ).toLocaleString("it-IT", { maximumFractionDigits: 0 })}
                          /mese
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow rounded-2xl">
          <CardHeader>
            <CardTitle>Informazioni Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">{clientData.company || "Nome Azienda"}</h3>
              <p className="text-gray-600">{clientData.name || "Nome Contatto"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-600">{clientData.email}</p>
              <p className="text-gray-600">{clientData.phone}</p>
              {clientData.address && <p className="text-gray-600">{clientData.address}</p>}
              {clientData.vatNumber && <p className="text-gray-600">P.IVA: {clientData.vatNumber}</p>}
            </div>

            {clientData.notes && (
              <div className="pt-2 border-t">
                <h4 className="font-medium text-sm">Note</h4>
                <p className="text-gray-600 text-sm">{clientData.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ID Preventivo</span>
                <span className="text-sm font-medium">{quote.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data</span>
                <span className="text-sm font-medium">{new Date().toLocaleDateString("it-IT")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Valido fino al</span>
                <span className="text-sm font-medium">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("it-IT")}
                </span>
              </div>

              {/* Piano di Fatturazione */}
              {paymentPlan && (
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600">Piano di Fatturazione</span>
                  <span className="text-sm font-medium">{paymentPlan === "annual" ? "Annuale" : "Mensile"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni</CardTitle>
          <CardDescription>Cosa vuoi fare con questo preventivo?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className={`${isGeneratingPDF ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Save className="mr-2 h-4 w-4" />
              {isGeneratingPDF ? "Generazione PDF in corso..." : "Genera PDF Preventivo"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
        <Button
          onClick={prevStep}
          variant="outline"
          className="px-6 py-2 w-full md:w-auto rounded-full hover:shadow-[0_0_12px_#ff0092]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Indietro
        </Button>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Button
            onClick={handleNewQuote}
            variant="outline"
            className="px-6 py-2 w-full md:w-auto rounded-full hover:shadow-[0_0_12px_#ff0092]"
          >
            Crea Nuovo Preventivo
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preventivo creato con successo</DialogTitle>
            <DialogDescription>
              Il preventivo è stato generato correttamente. Puoi scaricarlo cliccando sul pulsante qui sotto.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={handleDownloadPDF} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
