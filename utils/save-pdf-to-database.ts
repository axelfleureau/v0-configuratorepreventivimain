import { createClient } from "@supabase/supabase-js"

export async function savePDFToDatabase(
  pdfBase64: string,
  clientData: {
    name: string
    email: string
    phone: string
    company: string
  },
  quoteData: any,
  totalOneTime: number,
  totalMonthly: number,
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verifica che la tabella quotes esista
    const { error: checkError } = await supabase.from("quotes").select("id").limit(1)

    // Se la tabella non esiste, restituisci un errore con istruzioni
    if (checkError && checkError.message.includes("does not exist")) {
      console.log("La tabella quotes non esiste, setup manuale richiesto...")
      return {
        success: false,
        error: "La tabella quotes non esiste. Esegui prima lo script SQL di inizializzazione.",
        sqlScript: `
-- RIGHELLO CONFIGURATORE - SETUP DATABASE
-- Esegui questo SQL nel tuo editor SQL di Supabase

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
  monthly_price DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inserisci dati di default per company_settings
INSERT INTO company_settings (company_name, vat_number, email, phone, address, website, primary_color)
SELECT 'La Tua Azienda', 'IT12345678901', 'info@tuaazienda.com', '+39 123 456 7890', 'Via Roma 1, 00100 Roma', 'https://www.tuaazienda.com', '#ff0092'
WHERE NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1);

-- 4. Abilita Row Level Security
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- 5. Crea policy per permettere tutte le operazioni (per sviluppo)
CREATE POLICY IF NOT EXISTS "Allow all operations on company_settings" 
ON company_settings FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on quotes" 
ON quotes FOR ALL USING (true);

-- 6. Crea indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_client_email ON quotes(client_email);
        `,
      }
    }

    // Salva il PDF nel database usando la tabella quotes
    const { data, error } = await supabase
      .from("quotes")
      .insert({
        client_name: clientData.name || "Cliente senza nome",
        client_email: clientData.email || "",
        client_phone: clientData.phone || "",
        client_company: clientData.company || "",
        pdf_data: pdfBase64,
        metadata: quoteData,
        total_price: totalOneTime,
        monthly_price: totalMonthly,
        package_type: quoteData.packageType || "custom",
        filename: `Preventivo_${clientData.company || "Cliente"}_${Date.now()}.pdf`,
        issue_date: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Errore durante il salvataggio del PDF nel database:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Errore imprevisto durante il salvataggio del PDF:", error)
    return { success: false, error: error.message }
  }
}
