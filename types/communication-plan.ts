export interface CommunicationPlanData {
  type: "none" | "90" | "180" | "360" | "custom"
  platforms: string[]
  posts: number
  stories: number
  contentType: "graphics" | "photos" | "mix"
  degree: number
  price: number
  basePrice: number
  platformCosts: { [key: string]: number }
  totalPrice: number
  equivalentPlan: string
}

export interface PlatformOption {
  id: string
  name: string
  icon: string
  included: boolean
  cost: number
}

export interface PredefinedPlan {
  type: "90" | "180" | "360"
  name: string
  price: number
  degree: number
  platforms: string[]
  posts: number
  stories: number
  contentType: "graphics" | "photos" | "mix"
  features: string[]
}
