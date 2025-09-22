import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ServiceOption, QuoteData } from "@/types"
import { serviceOptions, servicePackages } from "@/data/services-data"
import { getSupabaseClient } from "@/lib/supabase-client"

// Fallback services data
const fallbackServices = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    package_id: null,
    name: "Basic maintenance",
    price: 150,
    cycle: "monthly",
    created_at: new Date().toISOString(),
    description: "Regular website maintenance and updates",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    package_id: null,
    name: "SEO monitoring",
    price: 200,
    cycle: "monthly",
    created_at: new Date().toISOString(),
    description: "Monthly SEO performance tracking and reporting",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    package_id: null,
    name: "One-shot landing",
    price: 800,
    cycle: "one-off",
    created_at: new Date().toISOString(),
    description: "Custom landing page design and development",
  },
]

interface ConfiguratorState {
  currentStep: number
  selectedPackage: string | null
  selectedServices: ServiceOption[]
  clientData: {
    name: string
    email: string
    phone: string
    company: string
    notes: string
  }
  paymentPlan: "monthly" | "annual"
  setCurrentStep: (step: number) => void
  setSelectedPackage: (packageId: string | null) => void
  toggleService: (service: ServiceOption) => void
  setClientData: (data: Partial<ConfiguratorState["clientData"]>) => void
  setPaymentPlan: (plan: "monthly" | "annual") => void
  getTotalPrice: () => number
  getMonthlyPrice: () => number
  getOneTimePrice: () => number
  reset: () => void
  populatePackageServices: (packageId: string) => Promise<void>
  addService: (service: ServiceOption) => void
  removeService: (serviceId: string) => void
  transport: { distance: number; cost: number }
  setTransport: (transport: { distance: number; cost: number }) => void
  packageData: { id: string; name: string; description: string } | null
  getDiscountRate: () => number
  showVatPrices: boolean
  setShowVatPrices: (show: boolean) => void
  discounts: { percentage: number; amount: number }
  prevStep: () => void
  generateQuote: () => QuoteData
  totals: { oneTime: number; monthly: number }
  resetConfigurator: () => void
}

const initialState = {
  currentStep: 0,
  selectedPackage: null,
  selectedServices: [],
  clientData: {
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  },
  paymentPlan: "monthly" as const,
  transport: { distance: 0, cost: 0 },
  showVatPrices: false,
  packageData: null,
  discounts: {
    percentage: 0,
    amount: 0,
  },
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setSelectedPackage: (packageId) => set({ selectedPackage: packageId }),
      toggleService: (service) =>
        set((state) => {
          const exists = state.selectedServices.find((s) => s.id === service.id)
          if (exists) {
            // If the service exists and has the same price, don't update
            if (exists.price === service.price) {
              return state // Return the same state to prevent re-render
            }
            return {
              selectedServices: state.selectedServices.filter((s) => s.id !== service.id),
            }
          }
          return {
            selectedServices: [...state.selectedServices, service],
          }
        }),
      setClientData: (data) =>
        set((state) => ({
          clientData: { ...state.clientData, ...data },
        })),
      setPaymentPlan: (plan) => set({ paymentPlan: plan }),
      getTotalPrice: () => {
        const state = get()
        const monthlyTotal = state.getMonthlyPrice()
        const oneTimeTotal = state.getOneTimePrice()

        if (state.paymentPlan === "annual") {
          // Apply 10% discount on communication services for annual payment
          const communicationServices = state.selectedServices.filter((s) => s.category === "communication")
          const communicationTotal = communicationServices.reduce(
            (sum, service) => sum + (service.priceMonthly || 0),
            0,
          )
          const annualDiscount = communicationTotal * 0.1
          return monthlyTotal * 12 - annualDiscount * 12 + oneTimeTotal
        }

        return monthlyTotal + oneTimeTotal
      },
      getMonthlyPrice: () => {
        const state = get()
        return state.selectedServices.reduce((sum, service) => sum + (service.priceMonthly || 0), 0)
      },
      getOneTimePrice: () => {
        const state = get()
        return state.selectedServices.reduce((sum, service) => sum + (service.priceOneTime || 0), 0)
      },
      reset: () => set({ ...initialState, packageData: null }),
      populatePackageServices: async (packageId: string) => {
        const selectedPackage = servicePackages.find((pkg) => pkg.id === packageId)
        if (!selectedPackage) return

        // Set package data
        set({
          packageData: {
            id: selectedPackage.id,
            name: selectedPackage.label || packageId,
            description: selectedPackage.description || "",
          },
        })

        try {
          const supabase = getSupabaseClient()

          // Try to fetch services from the database
          const { data: dbServices, error } = await supabase.from("services").select("*").eq("package_id", packageId)

          if (error) {
            // If the table doesn't exist, use static data
            if (error.message.includes("relation") && error.message.includes("does not exist")) {
              console.warn("Services table does not exist, using static package data")
              // Use the static package's included services
              const services: ServiceOption[] = []
              for (const serviceId of selectedPackage.includedServices || []) {
                for (const [category, options] of Object.entries(serviceOptions)) {
                  const option = options.find((opt) => opt.id === serviceId)
                  if (option) {
                    services.push(option)
                    break
                  }
                }
              }
              set({ selectedServices: services })
              return
            }
            throw error
          }

          // If we have database services, map them to ServiceOptions
          if (dbServices && dbServices.length > 0) {
            const services: ServiceOption[] = dbServices.map((dbService) => {
              // Try to find the matching service in our static data
              for (const [category, options] of Object.entries(serviceOptions)) {
                const option = options.find((opt) => opt.name === dbService.name)
                if (option) {
                  return {
                    ...option,
                    priceMonthly: dbService.cycle === "monthly" ? dbService.price : option.priceMonthly,
                    priceOneTime: dbService.cycle === "one-off" ? dbService.price : option.priceOneTime,
                  }
                }
              }
              // If not found in static data, create a new ServiceOption
              return {
                id: dbService.id,
                name: dbService.name,
                description: dbService.description || "",
                category: "additional",
                priceMonthly: dbService.cycle === "monthly" ? dbService.price : 0,
                priceOneTime: dbService.cycle === "one-off" ? dbService.price : 0,
              }
            })
            set({ selectedServices: services })
          } else {
            // No database services, use static package data
            const services: ServiceOption[] = []
            for (const serviceId of selectedPackage.includedServices || []) {
              for (const [category, options] of Object.entries(serviceOptions)) {
                const option = options.find((opt) => opt.id === serviceId)
                if (option) {
                  services.push(option)
                  break
                }
              }
            }
            set({ selectedServices: services })
          }
        } catch (error) {
          console.error("Error populating package services:", error)
          // Fallback to static package data
          const services: ServiceOption[] = []
          for (const serviceId of selectedPackage.includedServices || []) {
            for (const [category, options] of Object.entries(serviceOptions)) {
              const option = options.find((opt) => opt.id === serviceId)
              if (option) {
                services.push(option)
                break
              }
            }
          }
          set({ selectedServices: services })
        }
      },
      addService: (service) =>
        set((state) => {
          const exists = state.selectedServices.find((s) => s.id === service.id)
          if (exists && exists.price === service.price) {
            return state // Return the same state to prevent re-render
          }
          // Remove existing service with same ID if it exists
          const filteredServices = state.selectedServices.filter((s) => s.id !== service.id)
          return {
            selectedServices: [...filteredServices, service],
          }
        }),

      removeService: (serviceId) =>
        set((state) => {
          const exists = state.selectedServices.find((s) => s.id === serviceId)
          if (!exists) {
            return state // Return the same state to prevent re-render
          }
          return {
            selectedServices: state.selectedServices.filter((s) => s.id !== serviceId),
          }
        }),
      transport: initialState.transport,
      setTransport: (transport) => set({ transport }),
      packageData: initialState.packageData,
      getDiscountRate: () => {
        const state = get()
        if (state.paymentPlan === "annual") {
          return 0.1 // 10% discount for annual payment
        }
        return 0
      },
      showVatPrices: initialState.showVatPrices,
      setShowVatPrices: (show) => set({ showVatPrices: show }),
      discounts: {
        percentage: 0,
        amount: 0,
      },
      prevStep: () => {
        const currentStep = get().currentStep
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 })
        }
      },
      generateQuote: () => {
        const state = get()
        const now = new Date()
        const quoteId = `Q${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`

        return {
          id: quoteId,
          clientData: {
            companyName: state.clientData.company,
            contactName: state.clientData.name,
            email: state.clientData.email,
            phone: state.clientData.phone,
            address: "",
            vatNumber: "",
            notes: state.clientData.notes,
          },
          services: state.selectedServices,
          totals: {
            oneTime: state.getOneTimePrice(),
            monthly: state.getMonthlyPrice(),
          },
          discounts: {
            percentage: state.getDiscountRate() * 100,
            amount: state.getMonthlyPrice() * state.getDiscountRate(),
          },
          createdAt: now.toISOString(),
          validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "draft" as const,
          packageType: state.selectedPackage || "custom",
        }
      },
      get totals() {
        return {
          oneTime: get().getOneTimePrice(),
          monthly: get().getMonthlyPrice(),
        }
      },
      resetConfigurator: () => {
        set({ ...initialState, packageData: null })
      },
    }),
    {
      name: "configurator-storage",
    },
  ),
)
