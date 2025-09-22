# Struttura Logica del Configuratore Preventivi

## Panoramica Generale

Il configuratore è un'applicazione multi-step wizard costruita con **Next.js 14**, **TypeScript**, e **Zustand** per la gestione dello stato. È progettato per guidare gli utenti attraverso un processo strutturato di configurazione di servizi digitali, dalla selezione iniziale dei pacchetti fino alla generazione del preventivo finale.

## Architettura del Sistema

### 1. Stack Tecnologico
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **State Management**: Zustand con persistenza
- **UI Components**: Radix UI + Tailwind CSS + Framer Motion
- **Backend**: Supabase (database PostgreSQL + auth)
- **PDF Generation**: React-PDF + jsPDF
- **Styling**: Tailwind CSS con componenti personalizzati

### 2. Struttura Principale dei Componenti

```
src/
├── components/
│   ├── configurator-wrapper.tsx      # Container principale
│   ├── steps/                        # Step del configuratore
│   │   ├── package-selector.tsx      # Step 0: Selezione pacchetto
│   │   ├── service-configurator.tsx  # Step 1: Configurazione servizi
│   │   ├── client-data-form.tsx      # Step 2: Dati cliente
│   │   └── quote-recap.tsx           # Step 3: Riepilogo preventivo
│   ├── step-indicator.tsx            # Indicatore progresso
│   └── price-summary.tsx             # Riepilogo prezzi
├── store/
│   └── configurator-store.ts         # Store Zustand centralizzato
├── data/
│   ├── packages.ts                   # Definizione pacchetti predefiniti
│   └── services-data.ts              # Catalogo servizi completo
└── types/
    └── index.ts                      # Definizioni TypeScript
```

## 3. Flusso di Navigazione

### Step 0: Selezione Pacchetto (`PackageSelector`)
**Obiettivo**: Permettere all'utente di scegliere tra pacchetti predefiniti o configurazione personalizzata

**Componenti chiave**:
- `components/steps/package-selector.tsx`
- `hooks/use-real-time-packages.ts` (connessione real-time con Supabase)

**Logica**:
1. Carica pacchetti da database Supabase (con fallback a dati statici)
2. Mostra cards interattive con prezzi e descrizioni
3. Opzione "Personalizzato" per configurazione da zero
4. Al click su pacchetto → popola servizi inclusi nello store
5. Navigazione automatica allo step successivo

**Pacchetti disponibili**:
- **Base** (€3.500): Servizi essenziali
- **Test** (€6.000): Pacchetto di prova
- **Avanzato** (€7.000): Soluzione completa
- **Premium** (€15.000): Massimo livello
- **Personalizzato**: Configurazione su misura

### Step 1: Configurazione Servizi (`ServiceConfigurator`)
**Obiettivo**: Permettere la personalizzazione dettagliata dei servizi

**Componenti chiave**:
- `components/steps/service-configurator.tsx`
- Piano di comunicazione con calcolo "gradi" (90°, 180°, 360°)

**Categorie di servizi**:
1. **Sito Web**: Tipologia, pagine, lingue, funzionalità
2. **Gestione Annuale**: Hosting, manutenzione, aggiornamenti
3. **Piano di Comunicazione**: Social media con sistema gradi
4. **Foto e Video**: Shooting, video promozionali, pacchetti
5. **Branding**: Logo, identità visiva, brand book
6. **SEO**: Ottimizzazione base/avanzata, servizio mensile
7. **Advertising**: Budget e piattaforme (Google, Meta, LinkedIn)
8. **CRM/SIGE**: Moduli gestionali specializzati

**Sistema Gradi (Piano Comunicazione)**:
- **90°**: 2 post + 2 stories, 1 piattaforma, contenuti grafici (€300/mese)
- **180°**: 4 post + 4 stories, 2 piattaforme, mix grafico/foto (€800/mese)
- **360°**: 8 post + 8 stories, 3+ piattaforme, mix completo + DM (€1600/mese)
- **Personalizzato**: Calcolo dinamico basato su parametri

### Step 2: Dati Cliente (`ClientDataForm`)
**Obiettivo**: Raccogliere informazioni di contatto per il preventivo

**Campi richiesti**:
- Nome azienda
- Nome contatto
- Email
- Telefono
- Note aggiuntive

### Step 3: Riepilogo Preventivo (`QuoteRecap`)
**Obiettivo**: Mostrare riepilogo finale e generare PDF

**Funzionalità**:
- Visualizzazione servizi selezionati
- Calcolo prezzi con VAT opzionale
- Sconto annuale (10% su servizi comunicazione)
- Generazione PDF preventivo
- Opzione nuovo preventivo

## 4. Gestione dello Stato (Zustand Store)

### Struttura Store (`store/configurator-store.ts`)

```typescript
interface ConfiguratorState {
  // Navigazione
  currentStep: number
  
  // Selezione servizi
  selectedPackage: string | null
  selectedServices: ServiceOption[]
  
  // Dati cliente
  clientData: {
    name: string
    email: string
    phone: string
    company: string
    notes: string
  }
  
  // Configurazioni
  paymentPlan: "monthly" | "annual"
  transport: { distance: number; cost: number }
  showVatPrices: boolean
  
  // Calcoli
  getTotalPrice: () => number
  getMonthlyPrice: () => number
  getOneTimePrice: () => number
  getDiscountRate: () => number
  
  // Azioni
  setCurrentStep: (step: number) => void
  setSelectedPackage: (packageId: string | null) => void
  toggleService: (service: ServiceOption) => void
  populatePackageServices: (packageId: string) => Promise<void>
  generateQuote: () => QuoteData
}
```

### Persistenza
Lo store utilizza la funzionalità di persistenza di Zustand per mantenere i dati durante la navigazione e refresh della pagina.

## 5. Sistema di Prezzi

### Tipologie di Prezzo
- **priceOneTime**: Costi una tantum (setup, sviluppo)
- **priceMonthly**: Costi ricorrenti mensili
- **percentageIncrease**: Incrementi percentuali (es. drone +35%)
- **discountPercentage**: Sconti specifici (es. portfolio -50%)

### Calcolo Totali
```typescript
// Prezzo mensile base
getMonthlyPrice = () => 
  selectedServices.reduce((sum, service) => sum + (service.priceMonthly || 0), 0)

// Prezzo una tantum
getOneTimePrice = () => 
  selectedServices.reduce((sum, service) => sum + (service.priceOneTime || 0), 0)

// Sconto annuale (10% su servizi comunicazione)
getDiscountRate = () => paymentPlan === "annual" ? 0.1 : 0
```

### VAT e Fatturazione
- Toggle per mostrare prezzi con/senza IVA (22%)
- Piano annuale: sconto 10% sui servizi di comunicazione
- Trasporti: calcolo separato basato su distanza

## 6. Integrazione Database (Supabase)

### Tabelle Principali
- **packages**: Pacchetti disponibili con prezzi dinamici
- **services**: Servizi collegati ai pacchetti
- **quotes**: Preventivi generati e salvati

### Strategia Fallback
Il sistema implementa una strategia di fallback robusto:
1. **Prima scelta**: Carica dati da Supabase
2. **Fallback**: Usa dati statici da `data/packages.ts` e `data/services-data.ts`
3. **Resilienza**: Continua a funzionare anche con database offline

## 7. Logica del Piano di Comunicazione

### Sistema Gradi Personalizzato
Il configuratore include un sistema unico per calcolare piani di comunicazione personalizzati basato su "gradi":

```typescript
calculatePlanDegree = (platforms, posts, stories, contentType) => {
  const postContribution = Math.min(posts / 8, 1) * 120     // Max 120°
  const storiesContribution = Math.min(stories / 8, 1) * 60  // Max 60°
  const platformContribution = Math.min(platforms.length / 3, 1) * 120 // Max 120°
  
  let contentContribution = 0
  if (contentType === "graphics") contentContribution = 20
  else if (contentType === "photos") contentContribution = 40
  else contentContribution = 60 // mix
  
  return Math.min(360, Math.round((postContribution + storiesContribution + platformContribution + contentContribution) / 5) * 5)
}
```

### Prezzi Dinamici
- Base: €300/mese (90°)
- Incremento: €250 per ogni grado aggiuntivo oltre i 90°
- Formule personalizzate per configurazioni specifiche

## 8. Generazione PDF

### Processo
1. Raccolta dati da store Zustand
2. Formattazione dati per template PDF
3. Generazione usando `react-pdf` o `jsPDF`
4. Download automatico del file

### Contenuti PDF
- Intestazione aziendale
- Dati cliente
- Dettaglio servizi selezionati
- Calcolo prezzi con sconti
- Validità preventivo (30 giorni)
- Termini e condizioni

## 9. Caratteristiche Avanzate

### Real-time Updates
- Connessione WebSocket con Supabase per aggiornamenti real-time dei pacchetti
- Indicatore visivo "Connesso in tempo reale"

### Responsive Design
- Layout ottimizzato per desktop, tablet e mobile
- Componenti UI adattivi con Tailwind CSS

### Accessibilità
- Navigazione da tastiera
- ARIA labels
- Indicatori di stato chiari

### Performance
- Lazy loading dei componenti
- Ottimizzazione bundle con Next.js
- Persistenza stato locale per UX fluida

## 10. Punti di Estensione

### Nuovi Servizi
Aggiungere nuovi servizi in `data/services-data.ts`:
```typescript
{
  id: "nuovo-servizio",
  name: "Nome Servizio",
  description: "Descrizione",
  category: "categoria",
  group: "gruppo",
  priceOneTime: 500,
  priceMonthly: 50
}
```

### Nuovi Step
Creare nuovo componente in `components/steps/` e aggiornare array `steps` in `configurator-wrapper.tsx`

### Nuove Integrazioni
Il sistema è progettato per supportare facilmente:
- Nuovi provider di pagamento
- Sistemi CRM esterni
- API di terze parti
- Webhook per notifiche

---

*Questa documentazione fornisce una panoramica completa della struttura logica del configuratore. Per dettagli implementativi specifici, consultare il codice sorgente dei singoli componenti.*