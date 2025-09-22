import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function initializeDatabase() {
  try {
    const supabase = createClientComponentClient()

    // SQL per creare la tabella quotes
    const createQuotesTableSQL = `
      CREATE TABLE IF NOT EXISTS public.quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_name TEXT NOT NULL,
        client_company TEXT,
        client_email TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        pdf_data TEXT,
        filename TEXT,
        package_type TEXT,
        total_price NUMERIC,
        metadata JSONB
      );
    `

    // Esegui la query SQL per creare la tabella quotes
    const { error: quotesError } = await supabase.rpc("pgql", { query: createQuotesTableSQL })

    if (quotesError) {
      console.error("Errore durante la creazione della tabella quotes:", quotesError)
      return false
    }

    console.log("Database inizializzato con successo")
    return true
  } catch (error) {
    console.error("Errore durante l'inizializzazione del database:", error)
    return false
  }
}
