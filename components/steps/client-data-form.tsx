"use client"

import type React from "react"

import { useConfiguratorStore } from "@/store/configurator-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function ClientDataForm() {
  const { clientData, setClientData, setCurrentStep } = useConfiguratorStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep(3) // Move to the next step
  }

  const prevStep = () => {
    setCurrentStep(1) // Go back to the previous step
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Client Information</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Please provide your contact details to complete your quote.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={clientData.company || ""}
              onChange={(e) => setClientData({ company: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              value={clientData.name || ""}
              onChange={(e) => setClientData({ name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={clientData.email || ""}
              onChange={(e) => setClientData({ email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={clientData.phone || ""}
              onChange={(e) => setClientData({ phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={clientData.address || ""}
              onChange={(e) => setClientData({ address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatNumber">VAT Number</Label>
            <Input
              id="vatNumber"
              value={clientData.vatNumber || ""}
              onChange={(e) => setClientData({ vatNumber: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={clientData.notes || ""}
            onChange={(e) => setClientData({ notes: e.target.value })}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-between mt-8">
          <Button type="button" onClick={prevStep} variant="outline" className="px-6 py-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            type="submit"
            className="bg-[#ff0092] hover:bg-[#d6007a] text-white px-8 py-6 text-lg rounded-full shadow-[0_0_15px_rgba(255,0,146,0.3)]"
          >
            Continue to Quote Summary
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
