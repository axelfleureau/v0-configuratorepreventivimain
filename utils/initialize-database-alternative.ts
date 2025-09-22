import { createClient } from "@supabase/supabase-js"

export async function initializeDatabaseAlternative() {
  try {
    // Use only NEXT_PUBLIC_ variables for client-side code
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Validate that we have the required values
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined")
    }

    if (!supabaseAnonKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined")
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log("Inizializzazione database (metodo alternativo)...")

    // 1. Verifica se la tabella company_settings esiste già
    const { data: companySettingsExists, error: checkError } = await supabase
      .from("company_settings")
      .select("id")
      .limit(1)

    // Se la tabella non esiste, l'errore sarà "relation does not exist"
    if (checkError && checkError.message.includes("does not exist")) {
      console.log("La tabella company_settings non esiste. Devi crearla manualmente.")

      return {
        success: false,
        message: "Le tabelle del database non esistono. Esegui prima lo script SQL di inizializzazione.",
        sqlScript: `
-- Esegui questo SQL nel tuo database Supabase:

-- 1. Crea la tabella company_settings
CREATE TABLE IF NOT EXISTS company_settings (
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

-- 2. Crea la tabella quotes
CREATE TABLE IF NOT EXISTS quotes (
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

-- 3. Inserisci dati di default
INSERT INTO company_settings (company_name, vat_number, email, phone, address, website, primary_color)
VALUES ('La Tua Azienda', 'IT12345678901', 'info@tuaazienda.com', '+39 123 456 7890', 'Via Roma 1, 00100 Roma', 'https://www.tuaazienda.com', '#ff0092')
ON CONFLICT (id) DO NOTHING;

-- 4. Abilita RLS (Row Level Security) se necessario
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- 5. Crea policy per permettere l'accesso
CREATE POLICY "Allow all operations on company_settings" ON company_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on quotes" ON quotes FOR ALL USING (true);
        `,
      }
    }

    // 2. Se la tabella esiste, verifica se ha dati
    if (!checkError && (!companySettingsExists || companySettingsExists.length === 0)) {
      const { error: insertError } = await supabase.from("company_settings").insert({
        company_name: "La Tua Azienda",
        vat_number: "IT12345678901",
        email: "info@tuaazienda.com",
        phone: "+39 123 456 7890",
        address: "Via Roma 1, 00100 Roma",
        website: "https://www.tuaazienda.com",
        primary_color: "#ff0092",
      })

      if (insertError) {
        console.error("Errore inserimento dati default:", insertError)
      } else {
        console.log("Dati default inseriti con successo")
      }
    }

    // 3. Verifica se la tabella quotes esiste
    const { error: quotesCheckError } = await supabase.from("quotes").select("id").limit(1)

    if (quotesCheckError && quotesCheckError.message.includes("does not exist")) {
      return {
        success: false,
        message: "La tabella quotes non esiste. Esegui lo script SQL di inizializzazione.",
        sqlScript: `
-- Esegui questo SQL nel tuo database Supabase:

-- Crea la tabella quotes
CREATE TABLE IF NOT EXISTS quotes (
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

-- Abilita RLS (Row Level Security)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Crea policy per permettere l'accesso
CREATE POLICY "Allow all operations on quotes" ON quotes FOR ALL USING (true);
        `,
      }
    }

    // 4. Gestisci i bucket di storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (!bucketsError && buckets) {
      // Crea bucket preventivi se non esiste
      const preventiviBucketExists = buckets.some((bucket) => bucket.name === "preventivi")
      if (!preventiviBucketExists) {
        const { error: createPreventiviBucketError } = await supabase.storage.createBucket("preventivi", {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        })

        if (createPreventiviBucketError) {
          console.error("Errore creazione bucket preventivi:", createPreventiviBucketError)
        } else {
          console.log("Bucket preventivi creato con successo")
        }
      }

      // Crea bucket logos se non esiste
      const logosBucketExists = buckets.some((bucket) => bucket.name === "logos")
      if (!logosBucketExists) {
        const { error: createLogosBucketError } = await supabase.storage.createBucket("logos", {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        })

        if (createLogosBucketError) {
          console.error("Errore creazione bucket logos:", createLogosBucketError)
        } else {
          console.log("Bucket logos creato con successo")
        }
      }
    }

    return { success: true, message: "Database inizializzato con successo" }
  } catch (error: any) {
    console.error("Errore durante l'inizializzazione del database:", error)
    return { success: false, message: error.message }
  }
}
