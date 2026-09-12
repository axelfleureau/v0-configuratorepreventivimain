# Diagramma di Flusso del Configuratore

## Flusso Principale

```mermaid
graph TD
    A[Avvio Configuratore] --> B{Selezione Pacchetto}
    
    B --> C[Pacchetto Base<br/>€3.500]
    B --> D[Pacchetto Test<br/>€6.000]
    B --> E[Pacchetto Avanzato<br/>€7.000]
    B --> F[Pacchetto Premium<br/>€15.000]
    B --> G[Personalizzato<br/>Da €0]
    
    C --> H[Popola Servizi Inclusi]
    D --> H
    E --> H
    F --> H
    G --> I[Servizi Vuoti]
    
    H --> J[Configurazione Servizi]
    I --> J
    
    J --> K[8 Categorie di Servizi]
    K --> L[Sito Web]
    K --> M[Gestione Annuale]
    K --> N[Piano Comunicazione]
    K --> O[Foto e Video]
    K --> P[Branding]
    K --> Q[SEO]
    K --> R[Advertising]
    K --> S[CRM/SIGE]
    
    L --> T[Dati Cliente]
    M --> T
    N --> T
    O --> T
    P --> T
    Q --> T
    R --> T
    S --> T
    
    T --> U[Riepilogo Preventivo]
    U --> V[Calcolo Prezzi]
    V --> W[Generazione PDF]
    W --> X[Download/Invio]
```

## Architettura Componenti

```mermaid
graph TB
    subgraph "App Layer"
        APP[App/Layout]
    end
    
    subgraph "Container Layer"
        CW[ConfiguratorWrapper<br/>- Navigazione<br/>- Layout<br/>- Progress]
    end
    
    subgraph "Step Components"
        PS[PackageSelector<br/>Step 0]
        SC[ServiceConfigurator<br/>Step 1]
        CDF[ClientDataForm<br/>Step 2]
        QR[QuoteRecap<br/>Step 3]
    end
    
    subgraph "Shared Components"
        SI[StepIndicator]
        PSUM[PriceSummary]
        UI[UI Components<br/>Cards, Buttons, etc.]
    end
    
    subgraph "State Management"
        STORE[Zustand Store<br/>configurator-store.ts]
        PERSIST[Persistence Layer]
    end
    
    subgraph "Data Layer"
        STATIC[Static Data<br/>packages.ts<br/>services-data.ts]
        SUPA[Supabase<br/>Real-time DB]
    end
    
    APP --> CW
    CW --> PS
    CW --> SC
    CW --> SC
    CW --> QR
    CW --> SI
    CW --> PSUM
    
    PS --> STORE
    SC --> STORE
    CDF --> STORE
    QR --> STORE
    
    STORE --> PERSIST
    STORE --> STATIC
    STORE --> SUPA
```

## Gestione dello Stato

```mermaid
stateDiagram-v2
    [*] --> Step0_PackageSelection
    
    Step0_PackageSelection --> PackageSelected: selectPackage()
    PackageSelected --> Step1_ServiceConfig: nextStep()
    
    Step1_ServiceConfig --> ServicesConfigured: configureServices()
    ServicesConfigured --> Step2_ClientData: nextStep()
    
    Step2_ClientData --> ClientDataFilled: fillClientData()
    ClientDataFilled --> Step3_QuoteRecap: nextStep()
    
    Step3_QuoteRecap --> PDFGenerated: generatePDF()
    Step3_QuoteRecap --> NewQuote: createNewQuote()
    
    PDFGenerated --> [*]
    NewQuote --> Step0_PackageSelection: resetStore()
    
    note right of PackageSelected
        Store popola servizi
        del pacchetto selezionato
    end note
    
    note right of ServicesConfigured
        Calcolo prezzi dinamico
        con sconti e incrementi
    end note
```

## Piano di Comunicazione - Sistema Gradi

```mermaid
graph LR
    subgraph "Input Parameters"
        PLAT[Piattaforme<br/>1-3+]
        POST[Post/mese<br/>2-8]
        STOR[Stories/mese<br/>2-8]
        CONT[Tipo Contenuto<br/>Graphics/Photos/Mix]
    end
    
    subgraph "Calculation Logic"
        CALC[Calcolo Gradi<br/>∑ Contributi]
        
        PLATC[Piattaforme<br/>Max 120°]
        POSTC[Post<br/>Max 120°]
        STORC[Stories<br/>Max 60°]
        CONTC[Contenuto<br/>Max 60°]
    end
    
    subgraph "Output Plans"
        P90[Piano 90°<br/>€300/mese]
        P180[Piano 180°<br/>€800/mese]
        P360[Piano 360°<br/>€1600/mese]
        PCUST[Piano Personalizzato<br/>Calcolo dinamico]
    end
    
    PLAT --> PLATC
    POST --> POSTC
    STOR --> STORC
    CONT --> CONTC
    
    PLATC --> CALC
    POSTC --> CALC
    STORC --> CALC
    CONTC --> CALC
    
    CALC --> P90
    CALC --> P180
    CALC --> P360
    CALC --> PCUST
```

## Calcolo Prezzi

```mermaid
flowchart TD
    START[Inizio Calcolo] --> MONTHLY[Calcola Prezzi Mensili]
    START --> ONETIME[Calcola Prezzi Una Tantum]
    
    MONTHLY --> MSUM[∑ service.priceMonthly]
    ONETIME --> OSUM[∑ service.priceOneTime]
    
    MSUM --> PAYMENT{Piano Pagamento?}
    PAYMENT -->|Mensile| MVAT[Applica IVA se attiva]
    PAYMENT -->|Annuale| DISCOUNT[Applica Sconto 10%<br/>su comunicazione]
    
    DISCOUNT --> ANNUAL[Calcola × 12 mesi]
    ANNUAL --> AVAT[Applica IVA se attiva]
    
    OSUM --> OVAT[Applica IVA se attiva]
    
    MVAT --> TOTAL[Totale Finale]
    AVAT --> TOTAL
    OVAT --> TOTAL
    
    TOTAL --> DISPLAY[Mostra Prezzi]
```

## Integrazione Database

```mermaid
sequenceDiagram
    participant USER as User
    participant COMP as Component
    participant STORE as Store
    participant SUPA as Supabase
    participant FALLBACK as Static Data
    
    USER->>COMP: Seleziona Pacchetto
    COMP->>STORE: populatePackageServices(packageId)
    
    STORE->>SUPA: Fetch services by package_id
    
    alt Database Available
        SUPA-->>STORE: Return services data
        STORE->>STORE: Map to ServiceOption[]
    else Database Error/Offline
        SUPA-->>STORE: Error
        STORE->>FALLBACK: Fetch static package data
        FALLBACK-->>STORE: Return included services
    end
    
    STORE->>COMP: Update selectedServices
    COMP->>USER: Show configured services
```

## Generazione PDF

```mermaid
graph TD
    TRIGGER[User clicks Generate PDF] --> COLLECT[Raccolta Dati Store]
    
    COLLECT --> CLIENT[Client Data]
    COLLECT --> SERVICES[Selected Services]
    COLLECT --> PRICES[Calculated Prices]
    COLLECT --> DISCOUNTS[Applied Discounts]
    
    CLIENT --> FORMAT[Format Data for PDF]
    SERVICES --> FORMAT
    PRICES --> FORMAT
    DISCOUNTS --> FORMAT
    
    FORMAT --> TEMPLATE[Apply PDF Template]
    TEMPLATE --> GENERATE[Generate PDF Binary]
    GENERATE --> DOWNLOAD[Auto Download File]
    
    subgraph "PDF Content"
        HEADER[Company Header]
        CLIENTINFO[Client Information]
        ITEMLIST[Service Items List]
        PRICING[Pricing Summary]
        TERMS[Terms & Conditions]
        VALIDITY[Quote Validity: 30 days]
    end
```

---

*Questi diagrammi forniscono una rappresentazione visuale dei flussi e delle interazioni principali del configuratore preventivi.*