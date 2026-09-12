# 📊 ANALISI REPOSITORY: CONFIGURATORE PREVENTIVI RIGHELLO

> **OBIETTIVO**: Estrarre elementi di valore per ricostruire un configuratore preventivi da zero

---

## 🟢 DA CONSERVARE

### 1. BUSINESS LOGIC - Algoritmi di Calcolo Prezzi

#### **Calcolo Prezzi Comunicazione (Piano a Gradi)**
```typescript
// Da: components/steps/service-selection.tsx
const PLATFORM_WEIGHT = 40    // Peso piattaforme
const POSTS_WEIGHT = 180      // Peso post  
const STORIES_WEIGHT = 90     // Peso stories
const CONTENT_TYPE_WEIGHT = 50 // Peso tipo contenuto

// Algoritmo gradi personalizzati
function calculateDegree(platforms, posts, stories, contentType) {
  const platformScore = platforms.length * (PLATFORM_WEIGHT / 4)
  const postScore = posts * (POSTS_WEIGHT / 8) 
  const storyScore = stories * (STORIES_WEIGHT / 8)
  const contentScore = contentTypeWeights[contentType]
  
  return platformScore + postScore + storyScore + contentScore
}

// Prezzi fissi di riferimento
const PRICE_90 = 300   // Piano Base
const PRICE_180 = 800  // Piano Avanzato  
const PRICE_360 = 1600 // Piano Premium
```

#### **Sistema Sconti Dinamici**
```typescript
// Da: utils/pdf-generator-new.ts & components/price-summary.tsx
const isAnnualBilling = quoteData.paymentPlan === "annual"
const isCommunicationCategory = category === "communication"
const discountRate = isAnnualBilling && isCommunicationCategory ? 0.1 : 0

// Sconto 10% per pagamento annuale su piani comunicazione
if (paymentPlan === "annual") {
  discountAmount = monthlyPrice * 0.1
  displayMonthly = monthlyPrice - discountAmount
}
```

#### **Calcolo Prezzi Foto/Video con Percentuali**
```typescript  
// Da: data/services-data.ts
{
  id: "drone",
  name: "Riprese con Drone", 
  description: "Aggiungi riprese aeree (+35% sul totale video)",
  percentageIncrease: 35,
}

{
  id: "portfolio-discount",
  name: "Sconto Portfolio",
  description: "Autorizzo uso promozionale (-50% su video)",
  discountPercentage: 50,
}
```

### 2. STRUTTURE DATI FONDAMENTALI

#### **Modello Servizio Completo**
```typescript
// Da: types/index.ts
interface ServiceOption {
  id: string
  name: string
  description: string
  price: number
  priceOneTime?: number      // ⭐ FONDAMENTALE: Costi una tantum
  priceMonthly?: number      // ⭐ FONDAMENTALE: Costi ricorrenti
  selected?: boolean
  included?: boolean
  category: ServiceCategory
  group?: string            // ⭐ Raggruppamento logico servizi
  percentageIncrease?: number  // ⭐ Aumenti percentuali
  discountPercentage?: number  // ⭐ Sconti percentuali
}
```

#### **Categorie Servizi Strutturate**
```typescript
// Da: data/services-data.ts
export const serviceCategories = [
  { id: "website", name: "Sito Web", icon: Globe },
  { id: "management", name: "Gestione Annuale", icon: Settings },
  { id: "communication", name: "Piano di Comunicazione", icon: MessageSquare },
  { id: "photoVideo", name: "Foto e Video", icon: Camera },
  { id: "branding", name: "Branding", icon: Palette },
  { id: "seo", name: "SEO", icon: Search },
  { id: "advertising", name: "Advertising", icon: BarChart },
  { id: "crmSige", name: "CRM/SIGE", icon: Database },
]
```

#### **Sistema Pacchetti Predefiniti**
```typescript
// Da: data/services-data.ts  
export const servicePackages = [
  {
    id: "basic",
    name: "Pacchetto Base",
    basePrice: 2500,
    includedServices: ["website-single", "pages-5", "languages-0", "hosting-basic", "seo-basic"],
    border_color: "#10b981",
  },
  // ... altri pacchetti
]
```

### 3. ALGORITMI PRICING AVANZATI

#### **Calcolo Totali con Logica Complessa**
```typescript
// Da: data/services-data.ts
export const calculateTotalPrice = (
  packageType: ServicePackage,
  selectedServices: Record<ServiceCategory, ServiceOption[]>,
): number => {
  if (packageType === "custom") {
    return Object.values(selectedServices)
      .flat()
      .filter((service) => service.selected)
      .reduce((total, service) => 
        total + (service.priceOneTime || 0) + (service.priceMonthly || 0), 0)
  }

  const basePackage = servicePackages.find((pkg) => pkg.id === packageType)
  const includedServicesTotal = basePackage.basePrice
  
  // Servizi aggiuntivi (selezionati ma non inclusi)
  const additionalServicesTotal = Object.values(selectedServices)
    .flat()
    .filter((service) => service.selected && !service.included)
    .reduce((total, service) => 
      total + (service.priceOneTime || 0) + (service.priceMonthly || 0), 0)

  return includedServicesTotal + additionalServicesTotal
}
```

#### **Gestione VAT e Valute**
```typescript
// Da: utils/format.ts & components/price-summary.tsx
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency", 
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Applicazione IVA
const vatMultiplier = showVat ? 1.22 : 1
const displayPrice = price * vatMultiplier
```

### 4. GENERAZIONE PDF PROFESSIONALE

#### **Sistema PDF Multi-pagina**
```typescript
// Da: utils/pdf-generator-new.ts
export async function generatePDF(quoteData: PDFQuoteData, download = true) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  
  let currentPage = 1
  await generateCoverPage(doc, quoteData, primaryRgb, blackRgb, grayRgb)
  currentPage = await generateConfigurationPages(doc, quoteData, primaryRgb, blackRgb, grayRgb, currentPage)
  currentPage = await generateCostTables(doc, quoteData, primaryRgb, blackRgb, grayRgb, currentPage)
  currentPage = await generateSummaryPage(doc, quoteData, primaryRgb, blackRgb, grayRgb, currentPage)
  await generateAcceptancePage(doc, primaryRgb, blackRgb, grayRgb)
}
```

#### **Tabelle Costi Dinamiche**
```typescript
// Separazione servizi una tantum vs mensili
const oneTimeServices = services.filter((s) => s.priceOneTime && s.priceOneTime > 0)
const monthlyServices = services.filter((s) => s.priceMonthly && s.priceMonthly > 0)

// Applicazione sconti in tabella
if (discountRate > 0) {
  tableDataMonthly.push([
    "Sconto Pagamento Annuale", 
    `-${(discountAmount).toLocaleString("it-IT")} €`,
    "1", 
    `-${(discountAmount).toLocaleString("it-IT")} €`,
    "Mensile"
  ])
}
```

### 5. STATE MANAGEMENT ROBUSTO

#### **Store Zustand con Persistenza**
```typescript
// Da: store/configurator-store.ts
export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      selectedServices: [],
      clientData: { name: "", email: "", phone: "", company: "", notes: "" },
      paymentPlan: "monthly",
      transport: { distance: 0, cost: 0 },
      showVatPrices: false,
      
      addService: (service) => set((state) => ({
        selectedServices: [...state.selectedServices, { ...service, selected: true }]
      })),
      
      removeService: (serviceId) => set((state) => ({
        selectedServices: state.selectedServices.filter(s => s.id !== serviceId)
      })),
      
      getTotalPrice: () => {
        const { selectedServices, paymentPlan } = get()
        // Logica calcolo prezzi...
      }
    }),
    { name: "configurator-storage" }
  )
)
```

---

## 🔴 DA EVITARE 

### 1. PROBLEMI TECNICI CRITICI

#### **Dipendenze Rotte**
```json
// package.json - Versioni non esistenti
"@ai-sdk/openai": "^0.0.77",  // ❌ Versione inesistente
```

#### **Hardcoded Data vs Database**
```typescript
// constants/company-info.ts - ❌ Dati hardcoded invece di DB
export const COMPANY_INFO = {
  name: "Righello",
  vat_number: "IT12345678901", 
  email: "info@wearerighello.com",
  // ... dovrebbe venire da company_settings table
}
```

#### **Setup Database Complesso e Fragile**
```typescript
// Multiple file di setup database che si sovrappongono:
// - setup-database-complete.sql
// - setup-database-manual.sql  
// - app/api/setup-database/route.ts
// - utils/initialize-database.ts
// ❌ Troppa complessità per setup iniziale
```

### 2. ARCHITETTURA PROBLEMATICA

#### **Logica Business Sparsa nei Component**
```typescript
// ❌ Calcoli complessi direttamente nei componenti UI
// components/communication-plan/communication-plan-configurator.tsx
const calculateCustomPrice = () => {
  const degree = calculateCustomDegree()
  const basePrice = 300
  const additionalPrice = degree > 90 ? ((degree - 90) / 90) * 250 : 0
  // ... logica complessa nel componente
}
```

#### **Duplicazione Logiche di Calcolo**
```typescript
// ❌ Stessa logica pricing in più file:
// - components/steps/service-selection.tsx
// - components/communication-plan/communication-plan-configurator.tsx  
// - components/communication/CommunicationConfig.tsx
```

### 3. GESTIONE ERRORI INESISTENTE

#### **No Error Boundaries o Fallback**
```typescript
// ❌ Build fallisce per dipendenze, nessun graceful degradation
// ❌ No try/catch negli API calls
// ❌ No validation degli input utente
```

---

## 📊 DATI UTILI

### 1. CONFIGURAZIONI SERVIZI COMPLETE

#### **Database Schema Pulito**
```sql
-- Da: setup-database-complete.sql
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL DEFAULT 'La Tua Azienda',
  vat_number VARCHAR(50),
  address TEXT,
  email VARCHAR(255), 
  phone VARCHAR(50),
  website VARCHAR(255),
  logo_url TEXT,
  primary_color VARCHAR(20) DEFAULT '#ff0092',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255),
  client_company VARCHAR(255), 
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  pdf_data TEXT,
  filename VARCHAR(255),
  package_type VARCHAR(100),
  total_price DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### **Catalogo Servizi Completo**
```typescript
// 591 righe di servizi strutturati in 8 categorie
// Con prezzi, descrizioni, raggruppamenti logici
// Sistema di dipendenze e prerequisiti impliciti
```

#### **Costanti Business Critiche**
```typescript
// Prezzi fissi di riferimento
const PRICE_90 = 300, PRICE_180 = 800, PRICE_360 = 1600

// Pesi per calcolo gradi
const PLATFORM_WEIGHT = 40, POSTS_WEIGHT = 180, STORIES_WEIGHT = 90

// Tasso IVA e sconti
const VAT_RATE = 0.22  // 22%
const ANNUAL_DISCOUNT = 0.10  // 10% sconto annuale

// Colori brand
const COLORS = {
  primary: "#ff0092",
  black: "#1d1d1b", 
  gray: "#747474"
}
```

### 2. TESTI LEGALI E CONTRATTUALI

#### **Testo Accettazione Preventivo**
```typescript
// Da: constants/company-info.ts - 60 righe di testo legale
export const ACCEPTANCE_TEXT = `
OGGETTO DEL CONTRATTO
Il sottoscritto _____ accetta il preventivo per servizi di comunicazione digitale...

In caso di recesso unilaterale... penale pari al 10% del costo totale...
Preventivo validità fino al 31/06/25...
`
```

### 3. MAPPING PIATTAFORME SOCIAL

#### **Configurazione Piattaforme**
```typescript
const platformOptions = [
  { id: "instagram", name: "Instagram", included: true, cost: 0 },
  { id: "facebook", name: "Facebook", included: true, cost: 0 },
  { id: "linkedin", name: "LinkedIn", included: false, cost: 100 },
  { id: "tiktok", name: "TikTok", included: false, cost: 50 },
  { id: "twitter", name: "Twitter", included: false, cost: 25 },
  { id: "youtube", name: "YouTube", included: false, cost: 75 },
]
```

---

## 🔗 DIPENDENZE CHIAVE

### 1. LIBRARIES ESSENZIALI

#### **PDF Generation Stack**
```json
{
  "jspdf": "latest",           // ⭐ Core PDF generation
  "jspdf-autotable": "latest", // ⭐ Tabelle automatiche
  "html2canvas": "latest"      // ⭐ Screenshots per PDF
}
```

#### **State Management**
```json
{
  "zustand": "latest",         // ⭐ State management semplice
  "immer": "latest"           // ⭐ Immutable updates
}
```

#### **Database & Backend** 
```json
{
  "@supabase/supabase-js": "latest",           // ⭐ Database client
  "@supabase/auth-helpers-nextjs": "latest"   // ⭐ Auth integration
}
```

#### **UI Framework**
```json
{
  "next": "14.2.16",          // ⭐ Framework React
  "framer-motion": "latest",  // ⭐ Animazioni fluide
  "tailwindcss": "^3.3.0"    // ⭐ Styling system
}
```

#### **Form & Validation**
```json
{
  "react-hook-form": "^7.54.2",  // ⭐ Gestione form
  "zod": "^3.24.1",              // ⭐ Schema validation
  "@hookform/resolvers": "^3.10.0"
}
```

### 2. COMPONENTI UI CRITICI

#### **Radix UI Components**
```json
{
  "@radix-ui/react-accordion": "^1.2.2",
  "@radix-ui/react-checkbox": "^1.1.3", 
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-radio-group": "latest",
  "@radix-ui/react-slider": "^1.2.2",
  "@radix-ui/react-select": "^2.1.4"
}
```

#### **Icon System**
```json
{
  "lucide-react": "^0.454.0"  // ⭐ Icon library completa
}
```

---

## 💡 RACCOMANDAZIONI IMPLEMENTAZIONE

### 1. PRIORITÀ SVILUPPO

1. **⭐ FASE 1**: Ricreare il modello dati e algoritmi pricing
2. **⭐ FASE 2**: Implementare configuratore servizi con zustand  
3. **⭐ FASE 3**: Sistema generazione PDF con jspdf
4. **⭐ FASE 4**: Integrazione database Supabase
5. **⭐ FASE 5**: UI/UX con Radix + Tailwind

### 2. ARCHITETTURA SUGGERITA

```
src/
├── lib/
│   ├── pricing/           # ⭐ Tutta la logica business pricing
│   ├── pdf/              # ⭐ Generazione PDF isolata  
│   └── database/         # ⭐ Operazioni DB
├── stores/
│   └── configurator.ts   # ⭐ State management centralizzato
├── data/
│   ├── services.ts       # ⭐ Catalogo servizi
│   ├── packages.ts       # ⭐ Pacchetti predefiniti
│   └── constants.ts      # ⭐ Costanti business
└── components/
    ├── configurator/     # ⭐ Logica configuratore
    └── ui/              # ⭐ Componenti riutilizzabili
```

### 3. ELEMENTI DA PRESERVARE ASSOLUTAMENTE

- ✅ **Algoritmo calcolo gradi comunicazione** (unico e funzionale)
- ✅ **Sistema prezzi una tantum + mensili** (flessibile) 
- ✅ **Logica sconti percentuali e fissi** (completa)
- ✅ **Catalogo servizi strutturato** (ben organizzato)
- ✅ **Generazione PDF multi-pagina** (professionale)
- ✅ **Testi legali e contrattuali** (completi)

---

*Report generato il: $(date)*