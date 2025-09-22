"use client"

import { useEffect, useRef } from "react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import type { QuoteData, ServiceCategory } from "@/types"
import { getCategoryLabel } from "@/data/services-data"

interface PDFDocumentProps {
  quote: QuoteData
}

export function PDFDocument({ quote }: PDFDocumentProps) {
  const pdfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pdfRef.current) {
      generatePDF()
    }
  }, [])

  const generatePDF = async () => {
    if (!pdfRef.current) return

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 30

    pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`Righello_Quote_${quote.id}.pdf`)
  }

  return (
    <div ref={pdfRef} className="bg-white p-8 w-[210mm]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#ff0092]">QUOTE</h1>
          <p className="text-gray-600">#{quote.id}</p>
        </div>
        <div className="text-right">
          <img src="/images/logo_righello.png" alt="Righello Logo" className="h-12 w-auto mb-2" />
          <p className="text-sm text-gray-600">
            Righello Digital Agency
            <br />
            Via Example 123, 12345 City
            <br />
            info@righello.com | +39 123 456 7890
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Client</h2>
          <div className="border rounded p-4">
            <p className="font-medium">{quote.clientData.companyName}</p>
            <p>{quote.clientData.contactName}</p>
            <p>{quote.clientData.email}</p>
            <p>{quote.clientData.phone}</p>
            {quote.clientData.address && <p>{quote.clientData.address}</p>}
            {quote.clientData.vatNumber && <p>VAT: {quote.clientData.vatNumber}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Quote Details</h2>
          <div className="border rounded p-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Date:</span>
              <span>{quote.date}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Valid Until:</span>
              <span>{quote.validUntil}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Package:</span>
              <span>{quote.packageType.charAt(0).toUpperCase() + quote.packageType.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Services</h2>
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Service</th>
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(quote.selectedServices) as ServiceCategory[]).map((category) => {
            const categoryServices = quote.selectedServices[category].filter((service) => service.selected)

            if (categoryServices.length === 0) return null

            return (
              <>
                <tr key={category} className="border-b">
                  <td colSpan={3} className="py-2 font-medium">
                    {getCategoryLabel(category)}
                  </td>
                </tr>
                {categoryServices.map((service) => (
                  <tr key={service.id} className="border-b">
                    <td className="py-2">{service.name}</td>
                    <td className="py-2 text-sm text-gray-600">{service.description}</td>
                    <td className="py-2 text-right">€{service.price.toLocaleString("it-IT")}</td>
                  </tr>
                ))}
              </>
            )
          })}
          <tr className="font-bold">
            <td colSpan={2} className="py-4 text-right">
              Total:
            </td>
            <td className="py-4 text-right text-[#ff0092]">€{quote.totalPrice.toLocaleString("it-IT")}</td>
          </tr>
        </tbody>
      </table>

      {quote.clientData.notes && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <div className="border rounded p-4">
            <p>{quote.clientData.notes}</p>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-600 mt-12">
        <p>Thank you for your business!</p>
        <p>For any questions regarding this quote, please contact us at info@righello.com</p>
      </div>
    </div>
  )
}
