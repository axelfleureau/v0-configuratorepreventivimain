"use client"

import { formatCurrency } from "@/utils/format"

interface PriceSummaryProps {
  oneTimePrice: number
  monthlyPrice: number
  showVat: boolean
  paymentPlan: "monthly" | "annual"
}

export function PriceSummary({ oneTimePrice, monthlyPrice, showVat, paymentPlan }: PriceSummaryProps) {
  const vatMultiplier = showVat ? 1.22 : 1

  // Apply discount for annual payment
  let displayMonthly = monthlyPrice
  let discountAmount = 0

  if (paymentPlan === "annual") {
    discountAmount = monthlyPrice * 0.1 // 10% discount
    displayMonthly = monthlyPrice - discountAmount
  }

  // Apply VAT
  const displayOneTime = oneTimePrice * vatMultiplier
  displayMonthly = displayMonthly * vatMultiplier
  const discountWithVat = discountAmount * vatMultiplier

  // Calculate annual estimate
  const yearlyEstimate = displayMonthly * 12

  return (
    <div className="space-y-4">
      {/* One Time Cost */}
      {oneTimePrice > 0 && (
        <div className="space-y-2 pb-3 border-b">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Una Tantum</span>
          </div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(displayOneTime)}</div>
          <div className="text-xs text-gray-500">Costo iniziale</div>
        </div>
      )}

      {/* Monthly Cost */}
      {monthlyPrice > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Mensile</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(displayMonthly)}
            <span className="text-sm font-normal">/mese</span>
          </div>

          {paymentPlan === "annual" && discountAmount > 0 && (
            <div className="text-xs text-green-600">Sconto 10%: -{formatCurrency(discountWithVat)}/mese</div>
          )}

          <div className="text-xs text-gray-500">Costo ricorrente</div>
        </div>
      )}

      {/* Yearly Estimate */}
      {monthlyPrice > 0 && (
        <div className="pt-3 border-t space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">
              {paymentPlan === "annual" ? "Totale Annuale" : "Stima Annuale"}
            </span>
          </div>
          <div className="text-lg font-semibold text-[#ff0092]">{formatCurrency(yearlyEstimate)}</div>
          <div className="text-xs text-gray-500">{formatCurrency(displayMonthly)} × 12 mesi</div>
        </div>
      )}

      {/* VAT Info */}
      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500">
          {showVat ? "IVA 22% inclusa nei prezzi mostrati" : "IVA 22% da aggiungere ai prezzi mostrati"}
        </p>
      </div>
    </div>
  )
}
