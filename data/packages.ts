import type { Package } from "@/types"

export const packages: Package[] = [
  {
    id: "base",
    label: "Base 1",
    description: "Soluzione essenziale per iniziare la tua presenza online",
    basePrice: 3500,
    includedServiceIds: ["seo-basic", "seo-monthly-none", "video-base", "shooting-base", "content-0"],
    borderColor: "#10b981",
  },
  {
    id: "test",
    label: "Test",
    description: "A partire da €6.000",
    basePrice: 6000,
    includedServiceIds: ["website-multi", "logo-basic", "pages-10", "gallery-pdf", "languages-0"],
    borderColor: "#3b82f6",
  },
  {
    id: "advanced",
    label: "Avanzato",
    description: "Soluzione completa per una presenza online professionale",
    basePrice: 7000,
    includedServiceIds: ["seo-advanced", "seo-monthly-none", "video-base", "shooting-base", "content-5"],
    borderColor: "#ff0092",
  },
  {
    id: "premium",
    label: "Premium",
    description: "Soluzione completa e avanzata per una presenza online di alto livello",
    basePrice: 15000,
    includedServiceIds: ["seo-advanced", "seo-monthly", "video-premium", "shooting-premium", "video-pack-5"],
    borderColor: "#8b5cf6",
  },
  {
    id: "custom",
    label: "Personalizzato",
    description: "Costruisci la tua soluzione su misura",
    basePrice: 0,
    includedServiceIds: [],
    borderColor: "#6b7280",
  },
]
