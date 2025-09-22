"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Calculator, Euro } from "lucide-react"

interface CostCounterProps {
  oneTimeCost: number
  monthlyCost: number
  includeVAT: boolean
  onVATToggle: (include: boolean) => void
  className?: string
}

export function CostCounter({ oneTimeCost, monthlyCost, includeVAT, onVATToggle, className = "" }: CostCounterProps) {
  const [prevOneTime, setPrevOneTime] = useState(oneTimeCost)
  const [prevMonthly, setPrevMonthly] = useState(monthlyCost)
  const [oneTimeTrend, setOneTimeTrend] = useState<"up" | "down" | "same">("same")
  const [monthlyTrend, setMonthlyTrend] = useState<"up" | "down" | "same">("same")

  useEffect(() => {
    if (oneTimeCost > prevOneTime) {
      setOneTimeTrend("up")
    } else if (oneTimeCost < prevOneTime) {
      setOneTimeTrend("down")
    } else {
      setOneTimeTrend("same")
    }
    setPrevOneTime(oneTimeCost)
  }, [oneTimeCost, prevOneTime])

  useEffect(() => {
    if (monthlyCost > prevMonthly) {
      setMonthlyTrend("up")
    } else if (monthlyCost < prevMonthly) {
      setMonthlyTrend("down")
    } else {
      setMonthlyTrend("same")
    }
    setPrevMonthly(monthlyCost)
  }, [monthlyCost, prevMonthly])

  const vatMultiplier = includeVAT ? 1.22 : 1
  const displayOneTime = Math.round(oneTimeCost * vatMultiplier)
  const displayMonthly = Math.round(monthlyCost * vatMultiplier)
  const yearlyEstimate = displayMonthly * 12

  const getTrendIcon = (trend: "up" | "down" | "same") => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  return (
    <Card className={`sticky top-4 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-[#ff0092]" />
          Riepilogo Costi
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id="vat-toggle"
            checked={includeVAT}
            onCheckedChange={onVATToggle}
            className="data-[state=checked]:bg-[#ff0092]"
          />
          <Label htmlFor="vat-toggle" className="text-sm">
            {includeVAT ? "IVA Inclusa" : "IVA Esclusa"}
          </Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* One Time Cost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Una Tantum</span>
            {getTrendIcon(oneTimeTrend)}
          </div>
          <motion.div
            key={displayOneTime}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-bold text-green-600 numeric-value"
          >
            €{displayOneTime.toLocaleString("it-IT")}
          </motion.div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Costo iniziale</Badge>
        </div>

        {/* Monthly Cost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Mensile</span>
            {getTrendIcon(monthlyTrend)}
          </div>
          <motion.div
            key={displayMonthly}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-bold text-blue-600 numeric-value"
          >
            €{displayMonthly.toLocaleString("it-IT")}
          </motion.div>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Costo ricorrente</Badge>
        </div>

        {/* Yearly Estimate */}
        {displayMonthly > 0 && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-[#ff0092]" />
              <span className="text-sm font-medium text-gray-600">Stima Annuale</span>
            </div>
            <div className="text-lg font-semibold text-[#ff0092] numeric-value">
              €{yearlyEstimate.toLocaleString("it-IT")}
            </div>
            <p className="text-xs text-gray-500">Costi mensili × 12 mesi</p>
          </div>
        )}

        {/* VAT Info */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            {includeVAT ? <>IVA 22% inclusa nei prezzi mostrati</> : <>IVA 22% da aggiungere ai prezzi mostrati</>}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
