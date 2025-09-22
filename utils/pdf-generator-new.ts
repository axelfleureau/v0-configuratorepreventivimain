import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { QuoteData, ServiceCategory, ServiceOption } from "@/types"
import { getCategoryLabel } from "@/data/services-data"
import { getSupabaseClient } from "@/lib/supabase-client"
import { COMPANY_INFO, SECTION_DESCRIPTIONS, ACCEPTANCE_TEXT } from "@/constants/company-info"

interface PDFQuoteData extends QuoteData {
  includeVAT?: boolean
  transportCost?: number
  distance?: number
  paymentPlan?: string
  selectedServices?: ServiceOption[]
}

const COLORS = {
  primary: "#ff0092",
  black: "#1d1d1b",
  gray: "#747474",
  white: "#f0f0ea",
  lightGray: "#f5f5f5",
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 255, g: 0, b: 146 }
}

export async function generatePDF(quoteData: PDFQuoteData, download = true): Promise<string | null> {
  try {
    console.log("Generazione PDF in corso...")

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    doc.setFont("helvetica")

    const primaryRgb = hexToRgb(COLORS.primary)
    const blackRgb = hexToRgb(COLORS.black)
    const grayRgb = hexToRgb(COLORS.gray)

    let currentPage = 1

    await generateCoverPage(doc, quoteData, primaryRgb, blackRgb, grayRgb)
    currentPage = await generateConfigurationPages(doc, quoteData, primaryRgb, blackRgb, grayRgb, currentPage)
    currentPage = await generateCostTables(doc, quoteData, primaryRgb, blackRgb, grayRgb, currentPage)
    currentPage = await generateSummaryPage(doc, quoteData, primaryRgb, blackRgb, grayRgb, currentPage)
    await generateAcceptancePage(doc, primaryRgb, blackRgb, grayRgb)

    if (download) {
      const fileName = `Righello_Preventivo_${quoteData.clientData.companyName || "Cliente"}_${
        quoteData.id
      }.pdf`.replace(/[^a-z0-9_\-.]/gi, "_")
      doc.save(fileName)
      console.log("PDF generato e scaricato con successo")
      return null
    } else {
      const pdfBase64 = doc.output("datauristring")
      return pdfBase64
    }
  } catch (error) {
    console.error("Errore nella generazione del PDF:", error)
    throw error
  }
}

async function generateCoverPage(doc: jsPDF, quoteData: PDFQuoteData, primaryRgb: any, blackRgb: any, grayRgb: any) {
  let yPos = 20

  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  doc.rect(20, yPos, 40, 15, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text("RIGHELLO", 40, yPos + 10, { align: "center" })

  doc.setTextColor(grayRgb.r, grayRgb.g, grayRgb.b)
  doc.setFontSize(10)
  const today = new Date().toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  doc.text(`Data: ${today}`, 150, yPos + 5)

  yPos += 40

  doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b)
  doc.setFontSize(24)
  doc.text("Proposta personalizzata per", 20, yPos)
  yPos += 15

  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  doc.setFontSize(28)
  doc.text(quoteData.clientData.contactName || "Cliente", 20, yPos)
  yPos += 15

  doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b)
  doc.setFontSize(14)
  if (quoteData.clientData.companyName) {
    doc.text(`Azienda: ${quoteData.clientData.companyName}`, 20, yPos)
    yPos += 10
  }

  doc.text(`Data preventivo: ${today}`, 20, yPos)
  yPos += 20

  doc.setTextColor(grayRgb.r, grayRgb.g, grayRgb.b)
  doc.setFontSize(9)
  doc.text(
    `${COMPANY_INFO.name} | P.IVA: ${COMPANY_INFO.vat_number} | ${COMPANY_INFO.email} | ${COMPANY_INFO.phone}`,
    105,
    280,
    { align: "center" },
  )
}

async function generateConfigurationPages(
  doc: jsPDF,
  quoteData: PDFQuoteData,
  primaryRgb: any,
  blackRgb: any,
  grayRgb: any,
  currentPage: number,
): Promise<number> {
  // Raggruppa i servizi per categoria
  const servicesByCategory = groupServicesByCategory(quoteData.selectedServices || [])

  for (const [category, services] of Object.entries(servicesByCategory)) {
    if (services.length === 0) continue

    doc.addPage()
    currentPage++

    let yPos = 20

    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setFontSize(20)
    doc.text(`Configurazione - ${getCategoryLabel(category as ServiceCategory)}`, 20, yPos)
    yPos += 15

    doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b)
    doc.setFontSize(11)
    const description = SECTION_DESCRIPTIONS[category as ServiceCategory] || ""
    const lines = doc.splitTextToSize(description, 170)
    doc.text(lines, 20, yPos)
    yPos += lines.length * 5 + 10

    doc.setFontSize(12)
    doc.text("Servizi inclusi:", 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    services.forEach((service) => {
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
      doc.circle(25, yPos - 2, 1, "F")

      doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b)
      doc.setFont("helvetica", "bold")
      doc.text(service.name, 30, yPos)
      yPos += 5

      doc.setFont("helvetica", "normal")
      doc.setTextColor(grayRgb.r, grayRgb.g, grayRgb.b)
      const serviceLines = doc.splitTextToSize(service.description || "", 160)
      doc.text(serviceLines, 30, yPos)
      yPos += serviceLines.length * 5 + 5
    })

    addPageFooter(doc, currentPage, category)
  }

  return currentPage
}

async function generateCostTables(
  doc: jsPDF,
  quoteData: PDFQuoteData,
  primaryRgb: any,
  blackRgb: any,
  grayRgb: any,
  currentPage: number,
): Promise<number> {
  // Raggruppa i servizi per categoria
  const servicesByCategory = groupServicesByCategory(quoteData.selectedServices || [])

  for (const [category, services] of Object.entries(servicesByCategory)) {
    if (services.length === 0) continue

    doc.addPage()
    currentPage++

    let yPos = 20

    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setFontSize(20)
    doc.text(`Costi - ${getCategoryLabel(category as ServiceCategory)}`, 20, yPos)
    yPos += 20

    // Separa i servizi una tantum e mensili
    const oneTimeServices = services.filter((s) => s.priceOneTime && s.priceOneTime > 0)
    const monthlyServices = services.filter((s) => s.priceMonthly && s.priceMonthly > 0)

    // Calcola lo sconto per i servizi mensili di Piano di Comunicazione
    const isAnnualBilling = quoteData.paymentPlan === "annual"
    const isCommunicationCategory = category === "communication"
    const discountRate = isAnnualBilling && isCommunicationCategory ? 0.1 : 0

    // Tabella servizi una tantum
    if (oneTimeServices.length > 0) {
      const tableData = oneTimeServices.map((service) => [
        service.name,
        `${service.priceOneTime?.toLocaleString("it-IT")} €`,
        "1",
        `${service.priceOneTime?.toLocaleString("it-IT")} €`,
        "Una tantum",
      ])

      const totalOneTime = oneTimeServices.reduce((sum, s) => sum + (s.priceOneTime || 0), 0)

      tableData.push([
        { content: "TOTALE UNA TANTUM", styles: { fontStyle: "bold" } },
        "",
        "",
        { content: `${totalOneTime.toLocaleString("it-IT")} €`, styles: { fontStyle: "bold" } },
        { content: "Una tantum", styles: { fontStyle: "bold" } },
      ])

      autoTable(doc, {
        startY: yPos,
        head: [["Descrizione", "Prezzo unitario", "Quantità", "Subtotale", "Frequenza"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [blackRgb.r, blackRgb.g, blackRgb.b],
        },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "center" },
          3: { halign: "right" },
          4: { halign: "center" },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Tabella servizi mensili
    if (monthlyServices.length > 0) {
      // Calcola il totale mensile prima dello sconto
      const totalMonthlyBeforeDiscount = monthlyServices.reduce((sum, s) => sum + (s.priceMonthly || 0), 0)

      // Applica lo sconto se necessario
      const discountAmount = discountRate * totalMonthlyBeforeDiscount
      const totalMonthly = totalMonthlyBeforeDiscount - discountAmount

      // Prepara i dati della tabella
      const tableDataMonthly = monthlyServices.map((service) => {
        const servicePrice = service.priceMonthly || 0
        return [
          service.name,
          `${servicePrice.toLocaleString("it-IT")} €`,
          "1",
          `${servicePrice.toLocaleString("it-IT")} €`,
          "Mensile",
        ]
      })

      // Aggiungi riga di sconto se applicabile
      if (discountRate > 0) {
        tableDataMonthly.push([
          { content: "Sconto fatturazione annuale (10%)", styles: { fontStyle: "italic" } },
          "",
          "",
          {
            content: `-${discountAmount.toLocaleString("it-IT")} €`,
            styles: { fontStyle: "italic", textColor: [255, 0, 0] },
          },
          "",
        ])
      }

      // Aggiungi riga del totale
      tableDataMonthly.push([
        { content: "TOTALE MENSILE", styles: { fontStyle: "bold" } },
        "",
        "",
        { content: `${totalMonthly.toLocaleString("it-IT")} €`, styles: { fontStyle: "bold" } },
        { content: "Mensile", styles: { fontStyle: "bold" } },
      ])

      autoTable(doc, {
        startY: yPos,
        head: [["Descrizione", "Prezzo unitario", "Quantità", "Subtotale", "Frequenza"]],
        body: tableDataMonthly,
        theme: "grid",
        headStyles: {
          fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [blackRgb.r, blackRgb.g, blackRgb.b],
        },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "center" },
          3: { halign: "right" },
          4: { halign: "center" },
        },
      })
    }

    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(9)
    doc.setTextColor(grayRgb.r, grayRgb.g, grayRgb.b)
    doc.text(`* I prezzi sono da intendersi IVA 22% ${quoteData.includeVAT ? "inclusa" : "esclusa"}`, 20, finalY)

    addPageFooter(doc, currentPage, category)
  }

  return currentPage
}

// Modifica la funzione generateSummaryPage per mostrare correttamente i costi mensili e una tantum
async function generateSummaryPage(
  doc: jsPDF,
  quoteData: PDFQuoteData,
  primaryRgb: any,
  blackRgb: any,
  grayRgb: any,
  currentPage: number,
): Promise<number> {
  doc.addPage()
  currentPage++

  let yPos = 20

  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  doc.setFontSize(24)
  doc.text("Riepilogo Totale", 20, yPos)
  yPos += 20

  const summaryData: any[] = []
  let totalOneTime = 0
  let totalMonthly = 0

  // Raggruppa i servizi per categoria
  const servicesByCategory = groupServicesByCategory(quoteData.selectedServices || [])

  for (const [category, services] of Object.entries(servicesByCategory)) {
    if (services.length === 0) continue

    // Calcola i totali per categoria
    let categoryOneTime = 0
    let categoryMonthly = 0

    services.forEach((service) => {
      // Determina se il servizio è una tantum o mensile
      if (service.priceOneTime) {
        categoryOneTime += service.priceOneTime
      }
      if (service.priceMonthly) {
        categoryMonthly += service.priceMonthly
      }
    })

    // Applica lo sconto per i servizi mensili di Piano di Comunicazione
    const isAnnualBilling = quoteData.paymentPlan === "annual"
    const isCommunicationCategory = category === "communication"
    if (isAnnualBilling && isCommunicationCategory && categoryMonthly > 0) {
      categoryMonthly = categoryMonthly * 0.9 // Applica sconto del 10%
    }

    // Aggiungi la riga alla tabella solo se c'è un costo
    if (categoryOneTime > 0 || categoryMonthly > 0) {
      summaryData.push([
        getCategoryLabel(category as ServiceCategory),
        categoryOneTime > 0 ? `${categoryOneTime.toLocaleString("it-IT")} €` : "-",
        categoryMonthly > 0 ? `${categoryMonthly.toLocaleString("it-IT")} €` : "-",
      ])

      totalOneTime += categoryOneTime
      totalMonthly += categoryMonthly
    }
  }

  // Aggiungi subtotali
  summaryData.push([
    { content: "SUBTOTALE", styles: { fontStyle: "bold" } },
    { content: `${totalOneTime.toLocaleString("it-IT")} €`, styles: { fontStyle: "bold" } },
    { content: totalMonthly > 0 ? `${totalMonthly.toLocaleString("it-IT")} €` : "-", styles: { fontStyle: "bold" } },
  ])

  // Aggiungi IVA
  if (quoteData.includeVAT) {
    const vatAmountOneTime = totalOneTime * 0.22
    const vatAmountMonthly = totalMonthly * 0.22

    summaryData.push([
      "IVA 22%",
      `${vatAmountOneTime.toLocaleString("it-IT", { maximumFractionDigits: 0 })} €`,
      totalMonthly > 0 ? `${vatAmountMonthly.toLocaleString("it-IT", { maximumFractionDigits: 0 })} €` : "-",
    ])

    totalOneTime += vatAmountOneTime
    totalMonthly += vatAmountMonthly
  }

  // Aggiungi costo trasporto se presente
  if (quoteData.transportCost && quoteData.transportCost > 0) {
    summaryData.push(["Costo trasporto", `${quoteData.transportCost.toLocaleString("it-IT")} €`, "-"])
    totalOneTime += quoteData.transportCost
  }

  // Aggiungi totale finale
  summaryData.push([
    {
      content: `TOTALE ${quoteData.includeVAT ? "(IVA inclusa)" : "(IVA esclusa)"}`,
      styles: { fontStyle: "bold", fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b], textColor: [255, 255, 255] },
    },
    {
      content: `${totalOneTime.toLocaleString("it-IT", { maximumFractionDigits: 0 })} €`,
      styles: { fontStyle: "bold", fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b], textColor: [255, 255, 255] },
    },
    {
      content: totalMonthly > 0 ? `${totalMonthly.toLocaleString("it-IT", { maximumFractionDigits: 0 })} €` : "-",
      styles: { fontStyle: "bold", fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b], textColor: [255, 255, 255] },
    },
  ])

  autoTable(doc, {
    startY: yPos,
    head: [["Sezione", "Costo Una Tantum", "Costo Mensile"]],
    body: summaryData,
    theme: "grid",
    headStyles: {
      fillColor: [blackRgb.r, blackRgb.g, blackRgb.b],
      textColor: [255, 255, 255],
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(12)
  doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b)
  doc.setFont("helvetica", "bold")
  doc.text("Note importanti:", 20, finalY)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const notes = [
    "• Il preventivo ha validità 30 giorni dalla data di emissione",
    "• I prezzi sono soggetti a variazione fino a un massimo del +10%",
    "• Modalità di pagamento: 30% all'accettazione, saldo a fine lavori",
    "• Tempi di realizzazione: da concordare dopo l'accettazione",
  ]

  let noteY = finalY + 8
  notes.forEach((note) => {
    doc.text(note, 20, noteY)
    noteY += 6
  })

  noteY += 10
  doc.setFontSize(11)
  doc.text("Per informazioni e chiarimenti:", 20, noteY)
  noteY += 6
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  doc.text(`Email: ${COMPANY_INFO.email} | Tel: ${COMPANY_INFO.phone}`, 20, noteY)

  addPageFooter(doc, currentPage, "Riepilogo")

  return currentPage
}

async function generateAcceptancePage(doc: jsPDF, primaryRgb: any, blackRgb: any, grayRgb: any) {
  doc.addPage()

  let yPos = 20

  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  doc.setFontSize(20)
  doc.text("ACCETTAZIONE PREVENTIVO", 105, yPos, { align: "center" })
  yPos += 20

  doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  const acceptanceLines = ACCEPTANCE_TEXT.split("\n")
  acceptanceLines.forEach((line) => {
    if (line.trim()) {
      const wrappedLines = doc.splitTextToSize(line, 170)
      doc.text(wrappedLines, 20, yPos)
      yPos += wrappedLines.length * 5 + 2
    } else {
      yPos += 5
    }

    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
  })
}

function addPageFooter(doc: jsPDF, pageNumber: number, section: string) {
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Pagina ${pageNumber} | ${section}`, 20, 285)
  doc.text(COMPANY_INFO.name, 190, 285, { align: "right" })
}

// Funzione per raggruppare i servizi per categoria
function groupServicesByCategory(services: ServiceOption[]): Record<string, ServiceOption[]> {
  const result: Record<string, ServiceOption[]> = {}

  if (!Array.isArray(services)) {
    console.warn("selectedServices non è un array:", services)
    return result
  }

  services.forEach((service) => {
    const category = service.category || "other"
    if (!result[category]) {
      result[category] = []
    }
    result[category].push(service)
  })

  return result
}

export async function savePDFToDatabase(quoteData: PDFQuoteData): Promise<string | null> {
  try {
    const supabase = getSupabaseClient()

    const pdfBase64 = await generatePDF(quoteData, false)
    if (!pdfBase64) return null

    const metadata = {
      packageType: quoteData.packageType,
      selectedServices: quoteData.selectedServices,
      totalPrice: quoteData.totalPrice,
      includeVAT: quoteData.includeVAT || false,
      transportCost: quoteData.transportCost || 0,
    }

    const { data, error } = await supabase
      .from("quotes")
      .insert({
        client_name: quoteData.clientData.contactName || "Cliente",
        client_company: quoteData.clientData.companyName || null,
        client_email: quoteData.clientData.email || "email@example.com",
        client_phone: quoteData.clientData.phone || "000000000",
        pdf_data: pdfBase64,
        filename: `Preventivo_${quoteData.clientData.companyName || "Cliente"}_${quoteData.id}.pdf`,
        package_type: quoteData.packageType,
        total_price: quoteData.totalPrice,
        metadata: metadata,
      })
      .select()

    if (error) {
      console.error("Errore salvataggio preventivo:", error)
      return null
    }

    console.log("Preventivo salvato con successo:", data[0].id)
    return data[0].id
  } catch (error) {
    console.error("Errore nel salvataggio del PDF:", error)
    return null
  }
}

export async function downloadPDFFromDatabase(quoteId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("quotes").select("pdf_data, filename").eq("id", quoteId).single()

    if (error || !data) {
      throw new Error("Preventivo non trovato")
    }

    const base64Response = await fetch(data.pdf_data)
    const blob = await base64Response.blob()

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = data.filename || `Preventivo_${quoteId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Errore download PDF:", error)
    throw error
  }
}
