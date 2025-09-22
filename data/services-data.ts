import type { ServiceOption, ServiceCategory, ServicePackage, ServicePackageOption } from "@/types"
import { Globe, Settings, MessageSquare, Camera, Palette, Search, BarChart, Database } from "lucide-react"

export const serviceCategories: { id: ServiceCategory; name: string; icon: any }[] = [
  { id: "website", name: "Sito Web", icon: Globe },
  { id: "management", name: "Gestione Annuale", icon: Settings },
  { id: "communication", name: "Piano di Comunicazione", icon: MessageSquare },
  { id: "photoVideo", name: "Foto e Video", icon: Camera },
  { id: "branding", name: "Branding", icon: Palette },
  { id: "seo", name: "SEO", icon: Search },
  { id: "advertising", name: "Advertising", icon: BarChart },
  { id: "crmSige", name: "CRM/SIGE", icon: Database },
]

export const serviceOptions: Record<ServiceCategory, ServiceOption[]> = {
  website: [
    {
      id: "website-enabled",
      name: "Sito Web",
      description: "Abilita la sezione sito web",
      priceOneTime: 0,
      category: "website",
      group: "toggle",
    },
    {
      id: "website-single",
      name: "Sito Monopagina",
      description: "Sito web con tutte le informazioni in un'unica pagina scorrevole",
      priceOneTime: 1000,
      category: "website",
      group: "tipo-sito",
    },
    {
      id: "website-multi",
      name: "Sito Multipagina",
      description: "Sito web completo con più pagine e sezioni organizzate",
      priceOneTime: 2500,
      category: "website",
      group: "tipo-sito",
    },
    {
      id: "pages-5",
      name: "Fino a 5 pagine",
      description: "Ideale per siti web di piccole dimensioni",
      priceOneTime: 0,
      category: "website",
      group: "pagine",
    },
    {
      id: "pages-10",
      name: "6-10 pagine",
      description: "Adatto per siti web di medie dimensioni",
      priceOneTime: 750,
      category: "website",
      group: "pagine",
    },
    {
      id: "pages-custom",
      name: "Oltre 10 pagine",
      description: "Perfetto per siti web complessi",
      priceOneTime: 1500,
      category: "website",
      group: "pagine",
    },
    {
      id: "languages-0",
      name: "Solo italiano",
      description: "Sito in lingua italiana",
      priceOneTime: 0,
      category: "website",
      group: "lingue",
    },
    {
      id: "languages-1",
      name: "1 lingua aggiuntiva",
      description: "Sito bilingue",
      priceOneTime: 300,
      category: "website",
      group: "lingue",
    },
    {
      id: "languages-2",
      name: "2+ lingue aggiuntive",
      description: "Sito multilingue",
      priceOneTime: 600,
      category: "website",
      group: "lingue",
    },
    {
      id: "gallery-pdf",
      name: "Galleria PDF",
      description: "Sistema per caricare e visualizzare documenti PDF",
      priceOneTime: 300,
      category: "website",
      group: "funzionalita",
    },
    {
      id: "blog",
      name: "Blog",
      description: "Sezione blog per pubblicare articoli e novità",
      priceOneTime: 500,
      category: "website",
      group: "funzionalita",
    },
    {
      id: "area-login",
      name: "Area Riservata",
      description: "Area login per clienti o utenti registrati",
      priceOneTime: 800,
      category: "website",
      group: "funzionalita",
    },
  ],
  management: [
    {
      id: "hosting-basic",
      name: "Hosting Base",
      description: "Hosting condiviso con spazio e traffico limitati",
      priceMonthly: 27,
      category: "management",
      group: "hosting",
    },
    {
      id: "maintenance-basic",
      name: "Manutenzione Base",
      description: "Aggiornamenti di sicurezza e backup mensili",
      priceMonthly: 150,
      category: "management",
      group: "manutenzione",
    },
    {
      id: "content-light",
      name: "Aggiornamento Contenuti Light",
      description: "Inserimento contenuti 2-3 volte al mese",
      priceMonthly: 170,
      category: "management",
      group: "contenuti",
    },
  ],
  communication: [
    {
      id: "plan-90",
      name: "Piano 90°",
      description: "2 post + 2 stories, 1 piattaforma (IG o FB)",
      priceMonthly: 300,
      category: "communication",
      group: "piano",
    },
    {
      id: "plan-180",
      name: "Piano 180°",
      description: "4 post + 4 stories, 2 piattaforme",
      priceMonthly: 800,
      category: "communication",
      group: "piano",
    },
    {
      id: "plan-360",
      name: "Piano 360°",
      description: "8 post + 8 stories, 3+ piattaforme + gestione DM",
      priceMonthly: 1600,
      category: "communication",
      group: "piano",
    },
    {
      id: "plan-custom",
      name: "Piano Personalizzato",
      description: "Configura il tuo piano su misura",
      priceMonthly: 0,
      category: "communication",
      group: "piano",
      meta: {
        basePrice: 300,
        pricePerDegree: 250,
      },
    },
    {
      id: "content-0",
      name: "Nessun contenuto iniziale",
      description: "Partiamo da zero",
      priceOneTime: 0,
      category: "communication",
      group: "contenuti-iniziali",
    },
    {
      id: "content-5",
      name: "5 contenuti iniziali",
      description: "5 contenuti per partire",
      priceOneTime: 1500,
      category: "communication",
      group: "contenuti-iniziali",
    },
    {
      id: "content-10",
      name: "10 contenuti iniziali",
      description: "10 contenuti per partire",
      priceOneTime: 2500,
      category: "communication",
      group: "contenuti-iniziali",
    },
    {
      id: "content-15",
      name: "15 contenuti iniziali",
      description: "15 contenuti per partire",
      priceOneTime: 3500,
      category: "communication",
      group: "contenuti-iniziali",
    },
    {
      id: "frequency-1-2",
      name: "1-2 uscite/settimana",
      description: "Frequenza standard",
      priceMonthly: 0,
      category: "communication",
      group: "frequenza",
    },
    {
      id: "frequency-3-4",
      name: "3-4 uscite/settimana",
      description: "Frequenza elevata",
      priceMonthly: 300,
      category: "communication",
      group: "frequenza",
    },
  ],
  photoVideo: [
    {
      id: "video-none",
      name: "Nessun video",
      description: "Non richiedo video principale",
      priceOneTime: 0,
      category: "photoVideo",
      group: "video-principale",
    },
    {
      id: "video-base",
      name: "Video Base",
      description: "Video 30-45 secondi con riprese e montaggio semplice",
      priceOneTime: 700,
      category: "photoVideo",
      group: "video-principale",
    },
    {
      id: "video-premium",
      name: "Video Premium",
      description: "Video 45-60 secondi con riprese professionali",
      priceOneTime: 1200,
      category: "photoVideo",
      group: "video-principale",
    },
    {
      id: "video-promo",
      name: "Video Promozionale",
      description: "Video promozionale per nuovi clienti",
      priceOneTime: 299,
      category: "photoVideo",
      group: "video-principale",
    },
    {
      id: "shooting-none",
      name: "Nessuno shooting",
      description: "Non richiedo servizio fotografico",
      priceOneTime: 0,
      category: "photoVideo",
      group: "shooting",
    },
    {
      id: "shooting-base",
      name: "Shooting Base",
      description: "10-15 scatti professionali",
      priceOneTime: 250,
      category: "photoVideo",
      group: "shooting",
    },
    {
      id: "shooting-premium",
      name: "Shooting Premium",
      description: "20-30 scatti professionali",
      priceOneTime: 500,
      category: "photoVideo",
      group: "shooting",
    },
    {
      id: "video-pack-none",
      name: "Nessun pacchetto",
      description: "Non richiedo pacchetti video",
      priceOneTime: 0,
      category: "photoVideo",
      group: "pacchetto-video",
    },
    {
      id: "video-pack-5",
      name: "Pacchetto 5 video",
      description: "Serie di 5 video professionali",
      priceOneTime: 700,
      category: "photoVideo",
      group: "pacchetto-video",
    },
    {
      id: "video-pack-10",
      name: "Pacchetto 10 video",
      description: "Serie di 10 video professionali",
      priceOneTime: 1100,
      category: "photoVideo",
      group: "pacchetto-video",
    },
    {
      id: "drone",
      name: "Riprese con Drone",
      description: "Aggiungi riprese aeree (+35% sul totale video)",
      priceOneTime: 0,
      percentageIncrease: 35,
      category: "photoVideo",
      group: "extra-video",
    },
    {
      id: "social-video-none",
      name: "Nessun video social",
      description: "Non richiedo video per social",
      priceOneTime: 0,
      category: "photoVideo",
      group: "video-social",
    },
    {
      id: "social-video-5",
      name: "5 video social",
      description: "5 video brevi per social media",
      priceOneTime: 600,
      category: "photoVideo",
      group: "video-social",
    },
    {
      id: "social-video-10",
      name: "10 video social",
      description: "10 video brevi per social media",
      priceOneTime: 900,
      category: "photoVideo",
      group: "video-social",
    },
    {
      id: "extra-clips",
      name: "Clip Aggiuntive",
      description: "Clip extra derivate dai video (+15%)",
      priceOneTime: 0,
      percentageIncrease: 15,
      category: "photoVideo",
      group: "extra-video",
    },
    {
      id: "event-none",
      name: "Nessuna copertura",
      description: "Non richiedo copertura eventi",
      priceOneTime: 0,
      category: "photoVideo",
      group: "eventi",
    },
    {
      id: "event-base",
      name: "Evento Base (3h)",
      description: "Copertura fino a 3 ore",
      priceOneTime: 300,
      category: "photoVideo",
      group: "eventi",
    },
    {
      id: "event-1day",
      name: "Evento 1 giorno",
      description: "Copertura giornata intera",
      priceOneTime: 800,
      category: "photoVideo",
      group: "eventi",
    },
    {
      id: "event-2days",
      name: "Evento 2 giorni",
      description: "Copertura due giorni",
      priceOneTime: 1600,
      category: "photoVideo",
      group: "eventi",
    },
    {
      id: "portfolio-discount",
      name: "Sconto Portfolio",
      description: "Autorizzo uso promozionale (-50% su video)",
      priceOneTime: 0,
      discountPercentage: 50,
      category: "photoVideo",
      group: "sconti",
    },
  ],
  branding: [
    {
      id: "logo-none",
      name: "Nessun logo",
      description: "Non richiedo servizi logo",
      priceOneTime: 0,
      category: "branding",
      group: "logo",
    },
    {
      id: "logo-basic",
      name: "Logo Base",
      description: "Logo semplice versione vettoriale",
      priceOneTime: 500,
      category: "branding",
      group: "logo",
    },
    {
      id: "logo-premium",
      name: "Logo Premium",
      description: "Logo completo + brand book",
      priceOneTime: 1200,
      category: "branding",
      group: "logo",
    },
    {
      id: "identity-basic",
      name: "Identità Base",
      description: "Kit palette colori + font",
      priceOneTime: 300,
      category: "branding",
      group: "identita",
    },
    {
      id: "identity-full",
      name: "Identità Completa",
      description: "Manuale completo brand identity",
      priceOneTime: 800,
      category: "branding",
      group: "identita",
    },
    {
      id: "brand-book",
      name: "Brand Book",
      description: "Manuale d'uso del brand",
      priceOneTime: 600,
      category: "branding",
      group: "extra",
    },
  ],
  seo: [
    {
      id: "seo-none",
      name: "Nessun SEO",
      description: "Non richiedo ottimizzazione SEO",
      priceOneTime: 0,
      category: "seo",
      group: "seo-base",
    },
    {
      id: "seo-basic",
      name: "SEO Base",
      description: "Ottimizzazione SEO di base",
      priceOneTime: 500,
      category: "seo",
      group: "seo-base",
    },
    {
      id: "seo-advanced",
      name: "SEO Avanzato",
      description: "SEO completo con analisi competitor",
      priceOneTime: 1200,
      category: "seo",
      group: "seo-base",
    },
    {
      id: "seo-monthly-none",
      name: "Nessun SEO mensile",
      description: "Non richiedo servizio mensile",
      priceMonthly: 0,
      category: "seo",
      group: "seo-mensile",
    },
    {
      id: "seo-monthly",
      name: "SEO Mensile",
      description: "Report + ottimizzazione continua",
      priceMonthly: 300,
      category: "seo",
      group: "seo-mensile",
    },
  ],
  advertising: [
    {
      id: "ads-budget-0",
      name: "Nessun budget",
      description: "Non richiedo advertising",
      priceMonthly: 0,
      category: "advertising",
      group: "budget",
    },
    {
      id: "ads-budget-250",
      name: "Budget 250€/mese",
      description: "Budget advertising base",
      priceMonthly: 250,
      category: "advertising",
      group: "budget",
    },
    {
      id: "ads-budget-500",
      name: "Budget 500€/mese",
      description: "Budget advertising medio",
      priceMonthly: 500,
      category: "advertising",
      group: "budget",
    },
    {
      id: "ads-budget-1000",
      name: "Budget 1000€/mese",
      description: "Budget advertising elevato",
      priceMonthly: 1000,
      category: "advertising",
      group: "budget",
    },
    {
      id: "platform-google",
      name: "Google Ads",
      description: "Campagne su Google",
      priceMonthly: 0,
      category: "advertising",
      group: "piattaforme",
    },
    {
      id: "platform-meta",
      name: "Meta Ads",
      description: "Campagne su Facebook/Instagram",
      priceMonthly: 0,
      category: "advertising",
      group: "piattaforme",
    },
    {
      id: "platform-linkedin",
      name: "LinkedIn Ads",
      description: "Campagne su LinkedIn",
      priceMonthly: 0,
      category: "advertising",
      group: "piattaforme",
    },
  ],
  crmSige: [
    {
      id: "crm-employees",
      name: "Modulo Dipendenti",
      description: "Anagrafica dipendenti e turni",
      priceOneTime: 1500,
      category: "crmSige",
      group: "moduli",
    },
    {
      id: "crm-training",
      name: "Modulo Formazione",
      description: "Formazione obbligatoria e scadenze",
      priceOneTime: 500,
      category: "crmSige",
      group: "moduli",
    },
    {
      id: "crm-dpi",
      name: "Modulo DPI",
      description: "Gestione DPI e merchandising",
      priceOneTime: 400,
      category: "crmSige",
      group: "moduli",
    },
    {
      id: "crm-fleet",
      name: "Modulo Mezzi",
      description: "Mezzi e manutenzioni",
      priceOneTime: 1300,
      category: "crmSige",
      group: "moduli",
    },
    {
      id: "crm-plants",
      name: "Modulo Impianti",
      description: "Controlli periodici impianti",
      priceOneTime: 600,
      category: "crmSige",
      group: "moduli",
    },
    {
      id: "crm-docs",
      name: "Modulo Documenti",
      description: "Archivio certificazioni e normative",
      priceOneTime: 300,
      category: "crmSige",
      group: "moduli",
    },
  ],
}

export const servicePackages: ServicePackageOption[] = [
  {
    id: "basic",
    name: "Pacchetto Base",
    description: "Servizi digitali essenziali per piccole imprese",
    basePrice: 2500,
    includedServices: ["website-single", "pages-5", "languages-0", "hosting-basic", "seo-basic"],
    border_color: "#10b981",
  },
  {
    id: "standard",
    name: "Pacchetto Standard",
    description: "Servizi digitali completi per aziende in crescita",
    basePrice: 5000,
    includedServices: [
      "website-multi",
      "pages-10",
      "languages-1",
      "hosting-basic",
      "maintenance-basic",
      "seo-advanced",
      "plan-90",
      "shooting-base",
    ],
    border_color: "#3b82f6",
  },
  {
    id: "premium",
    name: "Pacchetto Premium",
    description: "Trasformazione digitale completa per aziende consolidate",
    basePrice: 10000,
    includedServices: [
      "website-multi",
      "pages-custom",
      "languages-2",
      "blog",
      "area-login",
      "hosting-basic",
      "maintenance-basic",
      "content-light",
      "seo-advanced",
      "seo-monthly",
      "plan-180",
      "video-base",
      "shooting-premium",
      "logo-basic",
      "identity-basic",
    ],
    border_color: "#ff0092",
  },
  {
    id: "custom",
    name: "Pacchetto Personalizzato",
    description: "Servizi digitali su misura in base alle tue esigenze specifiche",
    basePrice: 0,
    includedServices: [],
    border_color: "#8b5cf6",
  },
]

export const getCategoryLabel = (category: ServiceCategory): string => {
  const categoryObj = serviceCategories.find((cat) => cat.id === category)
  return categoryObj ? categoryObj.name : category
}

export const getCategoryIcon = (category: ServiceCategory): any => {
  const categoryObj = serviceCategories.find((cat) => cat.id === category)
  return categoryObj ? categoryObj.icon : null
}

export const getServiceGroups = (category: ServiceCategory): string[] => {
  const services = serviceOptions[category]
  const groups = [...new Set(services.map((service) => service.group || "default"))]
  return groups
}

export const getServicesByGroup = (category: ServiceCategory, group: string): ServiceOption[] => {
  return serviceOptions[category].filter((service) => service.group === group)
}

export const getGroupLabel = (group: string): string => {
  const groupLabels: Record<string, string> = {
    toggle: "Attivazione",
    "tipo-sito": "Tipologia Sito",
    pagine: "Numero di Pagine",
    lingue: "Lingue",
    funzionalita: "Funzionalità Extra",
    hosting: "Hosting",
    manutenzione: "Manutenzione",
    contenuti: "Aggiornamento Contenuti",
    piano: "Piano di Comunicazione",
    "contenuti-iniziali": "Contenuti Iniziali",
    frequenza: "Frequenza Pubblicazione",
    "video-principale": "Video Principale",
    shooting: "Shooting Fotografico",
    "pacchetto-video": "Pacchetto Video",
    "extra-video": "Opzioni Extra Video",
    "video-social": "Video Social",
    eventi: "Copertura Eventi",
    sconti: "Sconti",
    logo: "Logo",
    identita: "Identità Visiva",
    extra: "Extra Branding",
    "seo-base": "Servizi SEO",
    "seo-mensile": "SEO Mensile",
    budget: "Budget Mensile",
    piattaforme: "Piattaforme Advertising",
    moduli: "Moduli CRM",
    default: "",
  }

  return groupLabels[group] || group
}

export const getServicesByPackage = (packageId: ServicePackage): Record<ServiceCategory, ServiceOption[]> => {
  const selectedPackage = servicePackages.find((pkg) => pkg.id === packageId)
  if (!selectedPackage || packageId === "custom") {
    return Object.fromEntries(
      Object.entries(serviceOptions).map(([category, options]) => [
        category,
        options.map((option) => ({ ...option, selected: false })),
      ]),
    ) as Record<ServiceCategory, ServiceOption[]>
  }

  const result: Record<ServiceCategory, ServiceOption[]> = {} as Record<ServiceCategory, ServiceOption[]>

  Object.entries(serviceOptions).forEach(([category, options]) => {
    result[category as ServiceCategory] = options.map((option) => ({
      ...option,
      included: selectedPackage.includedServices.includes(option.id),
      selected: selectedPackage.includedServices.includes(option.id),
    }))
  })

  return result
}

export const calculateTotalPrice = (
  packageType: ServicePackage,
  selectedServices: Record<ServiceCategory, ServiceOption[]>,
): number => {
  if (packageType === "custom") {
    return Object.values(selectedServices)
      .flat()
      .filter((service) => service.selected)
      .reduce((total, service) => total + (service.priceOneTime || 0) + (service.priceMonthly || 0), 0)
  }

  const basePackage = servicePackages.find((pkg) => pkg.id === packageType)
  if (!basePackage) return 0

  const includedServicesTotal = basePackage.basePrice

  // Calcola servizi aggiuntivi (quelli selezionati ma non inclusi nel pacchetto)
  const additionalServicesTotal = Object.values(selectedServices)
    .flat()
    .filter((service) => service.selected && !service.included)
    .reduce((total, service) => total + (service.priceOneTime || 0) + (service.priceMonthly || 0), 0)

  return includedServicesTotal + additionalServicesTotal
}
