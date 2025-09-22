"use client"

import { useConfiguratorStore } from "@/store/configurator-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingDown, TrendingUp } from "lucide-react"

export function CostSummary() {
  const { services, showVatPrices } = useConfiguratorStore()
  const [prevOneTime, setPrevOneTime] = useState(0)
  const [prevMonthly, setPrevMonthly] = useState(0)

  const oneTimeCost = services
    .filter((service) => service.type === "oneTime")
    .reduce((total, service) => total + service.price, 0)

  const monthlyCost = services
    .filter((service) => service.type === "monthly")
    .reduce((total, service) => total + service.price, 0)

  const oneTimeIncreased = oneTimeCost > prevOneTime
  const oneTimeDecreased = oneTimeCost < prevOneTime
  const monthlyIncreased = monthlyCost > prevMonthly
  const monthlyDecreased = monthlyCost < prevMonthly

  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevOneTime(oneTimeCost)
      setPrevMonthly(monthlyCost)
    }, 300)

    return () => clearTimeout(timer)
  }, [oneTimeCost, monthlyCost])

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("it-IT")} €`
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Riepilogo Costi</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Costi Una Tantum</p>
          <div className="flex items-center gap-2">
            <motion.p
              key={oneTimeCost}
              initial={{ scale: 1 }}
              animate={{
                scale: oneTimeIncreased || oneTimeDecreased ? [1, 1.1, 1] : 1,
              }}
              className="text-2xl font-bold text-[#ff0092] numeric-value"
            >
              {formatPrice(showVatPrices ? Math.round(oneTimeCost * 1.22) : oneTimeCost)}
            </motion.p>
            {oneTimeIncreased && <TrendingUp className="h-4 w-4 text-green-500" />}
            {oneTimeDecreased && <TrendingDown className="h-4 w-4 text-red-500" />}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-500">Costi Mensili</p>
          <div className="flex items-center gap-2">
            <motion.p
              key={monthlyCost}
              initial={{ scale: 1 }}
              animate={{
                scale: monthlyIncreased || monthlyDecreased ? [1, 1.1, 1] : 1,
              }}
              className="text-2xl font-bold text-[#ff0092] numeric-value"
            >
              {formatPrice(showVatPrices ? Math.round(monthlyCost * 1.22) : monthlyCost)}/mese
            </motion.p>
            {monthlyIncreased && <TrendingUp className="h-4 w-4 text-green-500" />}
            {monthlyDecreased && <TrendingDown className="h-4 w-4 text-red-500" />}
          </div>
        </div>

        <div className="col-span-2 pt-2 text-sm text-gray-500">
          {showVatPrices ? "Prezzi IVA inclusa" : "Prezzi IVA esclusa"}
        </div>
      </CardContent>
    </Card>
  )
}
