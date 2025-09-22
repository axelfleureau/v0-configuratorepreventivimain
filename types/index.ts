export type ServicePackage = "base" | "test" | "advanced" | "premium" | "custom"
export type PaymentPlan = "quarterly" | "semi" | "annual"

export type ServiceCategory =
  | "website"
  | "management"
  | "communication"
  | "photoVideo"
  | "branding"
  | "seo"
  | "advertising"
  | "crmSige"

export interface ServiceOption {
  id: string
  name: string
  description: string
  price: number
  priceOneTime?: number
  priceMonthly?: number
  selected?: boolean
  included?: boolean
  category: ServiceCategory
  group?: string
  percentageIncrease?: number
  discountPercentage?: number
}

export interface ClientData {
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  vatNumber: string
  notes: string
}

export interface QuoteState {
  selectedOptions: Record<string, any[]>
  clientData: ClientData
  totals: { oneTime: number; monthly: number }
  discounts: Record<string, number>
  transport: { distance: number; cost: number }
  showVatPrices: boolean
  paymentPlan: PaymentPlan
  selectedPackageId: string | null
}

export interface QuoteData {
  id: string
  date: string
  packageType: ServicePackage
  selectedServices: Record<ServiceCategory, ServiceOption[]>
  clientData: ClientData
  totalPrice: number
  monthlyPrice: number
  validUntil: string
  includeVAT: boolean
  transportCost: number
  distance: number
  paymentPlan: PaymentPlan
  discountRate: number
}

export interface Package {
  id: string
  label: string
  description: string
  basePrice: number
  includedServiceIds: string[]
  borderColor: string
}
