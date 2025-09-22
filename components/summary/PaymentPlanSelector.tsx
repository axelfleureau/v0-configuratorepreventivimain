"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useConfiguratorStore } from "@/store/configurator-store"
import type { PaymentPlan } from "@/types"

export function PaymentPlanSelector() {
  const { paymentPlan, setPaymentPlan } = useConfiguratorStore()

  const handlePlanChange = (value: string) => {
    setPaymentPlan(value as PaymentPlan)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Piano di Fatturazione</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={paymentPlan} onValueChange={handlePlanChange} className="space-y-3">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="quarterly" id="quarterly" />
            <Label htmlFor="quarterly" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Trimestrale</p>
                <p className="text-sm text-gray-600">Nessuno sconto</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="semi" id="semi" />
            <Label htmlFor="semi" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Semestrale</p>
                <p className="text-sm text-gray-600">Sconto del 5% sul Piano di Comunicazione</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="annual" id="annual" />
            <Label htmlFor="annual" className="flex-1 cursor-pointer">
              <div>
                <p className="font-medium">Annuale</p>
                <p className="text-sm text-gray-600">Sconto del 10% sul Piano di Comunicazione</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
