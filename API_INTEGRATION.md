# Integrazione API e Database

## Supabase Integration

### 1. Schema Database

#### Tabella `packages`
```sql
CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descrizione TEXT,
  prezzo DECIMAL(10,2) NOT NULL,
  border_color TEXT DEFAULT '#ff0092',
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Esempio dati
INSERT INTO packages VALUES 
('base', 'Pacchetto Base', 'Soluzione essenziale per iniziare', 3500.00, '#10b981', '["Hosting base", "Sito monopagina", "SEO base"]'),
('advanced', 'Pacchetto Avanzato', 'Soluzione completa', 7000.00, '#ff0092', '["Hosting premium", "Sito multipagina", "SEO avanzato", "Piano comunicazione"]');
```

#### Tabella `services`
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id TEXT REFERENCES packages(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cycle TEXT CHECK (cycle IN ('monthly', 'one-off', 'annual')) DEFAULT 'one-off',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Esempio dati
INSERT INTO services VALUES 
(gen_random_uuid(), 'base', 'Hosting Base', 'Hosting condiviso per siti web', 27.00, 'monthly', 'management'),
(gen_random_uuid(), 'base', 'Sito Monopagina', 'Sito web su singola pagina', 1000.00, 'one-off', 'website');
```

#### Tabella `quotes`
```sql
CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  client_data JSONB NOT NULL,
  selected_services JSONB NOT NULL,
  totals JSONB NOT NULL,
  discounts JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  package_type TEXT
);
```

### 2. Real-time Hooks

#### `useRealTimePackages`
```typescript
// hooks/use-real-time-packages.ts
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

interface Package {
  id: string
  nome: string
  descrizione: string
  prezzo: number
  border_color: string
  features: string[]
}

export function useRealTimePackages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    
    // Fetch iniziale
    const fetchPackages = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('prezzo', { ascending: true })
        
        if (error) throw error
        
        setPackages(data || [])
      } catch (err) {
        console.error('Error fetching packages:', err)
        setError(err.message)
        // Fallback a dati statici
        setPackages(fallbackPackages)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackages()

    // Subscription per aggiornamenti real-time
    const subscription = supabase
      .channel('packages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'packages' }, 
        (payload) => {
          console.log('Package updated:', payload)
          setIsRefetching(true)
          // Refetch packages
          fetchPackages().finally(() => setIsRefetching(false))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { packages, isLoading, isRefetching, error }
}
```

### 3. Client Setup

```typescript
// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Non serve auth per il configuratore pubblico
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  return supabaseClient
}
```

## PDF Generation API

### 1. Struttura Dati Preventivo

```typescript
// types/quote.ts
export interface QuoteData {
  id: string
  clientData: {
    companyName: string
    contactName: string
    email: string
    phone: string
    address?: string
    vatNumber?: string
    notes?: string
  }
  services: ServiceOption[]
  totals: {
    oneTime: number
    monthly: number
    vat?: number
    total: number
  }
  discounts: {
    percentage: number
    amount: number
  }
  createdAt: string
  validUntil: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  packageType: string
}
```

### 2. PDF Generator

```typescript
// utils/pdf-generator-new.ts
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import type { QuoteData } from '@/types'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color: '#ff0092',
    fontWeight: 'bold'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee'
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff0092',
    marginTop: 20,
    textAlign: 'right'
  }
})

const QuotePDFDocument = ({ quote }: { quote: QuoteData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.section}>
        <Text style={styles.header}>Preventivo #{quote.id}</Text>
        <Text>Data: {new Date(quote.createdAt).toLocaleDateString('it-IT')}</Text>
        <Text>Valido fino al: {new Date(quote.validUntil).toLocaleDateString('it-IT')}</Text>
      </View>

      {/* Client Data */}
      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Dati Cliente
        </Text>
        <Text>Azienda: {quote.clientData.companyName}</Text>
        <Text>Contatto: {quote.clientData.contactName}</Text>
        <Text>Email: {quote.clientData.email}</Text>
        <Text>Telefono: {quote.clientData.phone}</Text>
        {quote.clientData.notes && (
          <Text style={{ marginTop: 10 }}>Note: {quote.clientData.notes}</Text>
        )}
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Servizi Selezionati
        </Text>
        {quote.services.map((service, index) => (
          <View key={index} style={styles.serviceItem}>
            <View style={{ flex: 3 }}>
              <Text style={{ fontWeight: 'bold' }}>{service.name}</Text>
              <Text style={{ fontSize: 10, color: '#666' }}>{service.description}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              {service.priceOneTime && (
                <Text>€{service.priceOneTime.toFixed(2)} (una tantum)</Text>
              )}
              {service.priceMonthly && (
                <Text>€{service.priceMonthly.toFixed(2)}/mese</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Riepilogo Prezzi
        </Text>
        
        {quote.totals.oneTime > 0 && (
          <View style={styles.serviceItem}>
            <Text>Costi una tantum:</Text>
            <Text>€{quote.totals.oneTime.toFixed(2)}</Text>
          </View>
        )}
        
        {quote.totals.monthly > 0 && (
          <View style={styles.serviceItem}>
            <Text>Costi mensili:</Text>
            <Text>€{quote.totals.monthly.toFixed(2)}/mese</Text>
          </View>
        )}
        
        {quote.discounts.amount > 0 && (
          <View style={styles.serviceItem}>
            <Text>Sconto ({quote.discounts.percentage}%):</Text>
            <Text style={{ color: '#10b981' }}>-€{quote.discounts.amount.toFixed(2)}</Text>
          </View>
        )}
        
        {quote.totals.vat && (
          <View style={styles.serviceItem}>
            <Text>IVA (22%):</Text>
            <Text>€{quote.totals.vat.toFixed(2)}</Text>
          </View>
        )}
        
        <Text style={styles.total}>
          Totale: €{quote.totals.total.toFixed(2)}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.section}>
        <Text style={{ fontSize: 10, color: '#666', textAlign: 'center' }}>
          Preventivo generato automaticamente dal configuratore
        </Text>
      </View>
    </Page>
  </Document>
)

export const generatePDF = async (quote: QuoteData): Promise<string> => {
  try {
    // Genera il PDF come blob
    const blob = await pdf(<QuotePDFDocument quote={quote} />).toBlob()
    
    // Crea URL per download
    const url = URL.createObjectURL(blob)
    
    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = `preventivo-${quote.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Cleanup
    URL.revokeObjectURL(url)
    
    return 'PDF generato con successo'
  } catch (error) {
    console.error('Errore generazione PDF:', error)
    throw new Error('Errore durante la generazione del PDF')
  }
}
```

## Storage e Cache

### 1. Local Storage Strategy

```typescript
// utils/storage.ts
interface StorageData {
  configurator: ConfiguratorState
  preferences: UserPreferences
  cache: CacheData
}

class ConfiguratorStorage {
  private readonly PREFIX = 'righello-configurator'
  
  save<K extends keyof StorageData>(key: K, data: StorageData[K]): void {
    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(`${this.PREFIX}-${key}`, serialized)
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }
  
  load<K extends keyof StorageData>(key: K): StorageData[K] | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}-${key}`)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
      return null
    }
  }
  
  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key))
  }
}

export const storage = new ConfiguratorStorage()
```

### 2. Cache Strategy

```typescript
// utils/cache.ts
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minuti
  
  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Verifica scadenza
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  // Cleanup automatico scaduti
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new DataCache()

// Cleanup periodico
setInterval(() => cache.cleanup(), 60000) // Ogni minuto
```

## Error Handling

### 1. Error Boundary

```typescript
// components/error-boundary.tsx
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ConfiguratorErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Configurator Error:', error, errorInfo)
    
    // Log a servizio esterno
    this.logErrorToService(error, errorInfo)
    
    this.setState({ error, errorInfo })
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Implementa logging verso servizio esterno
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Ops! Qualcosa è andato storto
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#ff0092] hover:bg-[#d6007a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0092]"
              >
                Ricarica Pagina
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 2. API Error Handling

```typescript
// utils/api-error-handler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const handleAPIError = (error: any): APIError => {
  if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
    return new APIError('Database table non trovata, utilizzo dati di fallback', 404, 'TABLE_NOT_FOUND')
  }
  
  if (error.status === 401) {
    return new APIError('Accesso non autorizzato', 401, 'UNAUTHORIZED')
  }
  
  if (error.status >= 500) {
    return new APIError('Errore del server, riprova più tardi', 500, 'SERVER_ERROR')
  }
  
  return new APIError(error.message || 'Errore sconosciuto', error.status || 500)
}
```

---

*Questa documentazione delle API e integrazioni fornisce una base solida per l'estensione e manutenzione del sistema.*