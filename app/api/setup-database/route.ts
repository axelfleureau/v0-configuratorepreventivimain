import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Supabase environment variables",
          needsManualSetup: true,
          sqlScript: getManualSetupSQL(),
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results = []

    // Check if company_settings table exists
    try {
      const { error } = await supabase.from("company_settings").select("id").limit(1)

      if (error && error.message.includes("does not exist")) {
        results.push({
          operation: "Create company_settings table",
          success: false,
          error: "Table does not exist - manual setup required",
        })
      } else {
        results.push({
          operation: "Check company_settings table",
          success: true,
        })

        // Check if table is empty and insert default data
        const { data: existingData } = await supabase.from("company_settings").select("id").limit(1)

        if (!existingData || existingData.length === 0) {
          const { error: insertError } = await supabase.from("company_settings").insert({
            company_name: "La Tua Azienda",
            vat_number: "IT12345678901",
            email: "info@tuaazienda.com",
            phone: "+39 123 456 7890",
            address: "Via Roma 1, 00100 Roma",
            website: "https://www.tuaazienda.com",
            primary_color: "#ff0092",
          })

          results.push({
            operation: "Insert default company settings",
            success: !insertError,
            error: insertError?.message,
          })
        }
      }
    } catch (err: any) {
      results.push({
        operation: "Setup company_settings",
        success: false,
        error: err.message,
      })
    }

    // Check if quotes table exists
    try {
      const { error } = await supabase.from("quotes").select("id").limit(1)

      if (error && error.message.includes("does not exist")) {
        results.push({
          operation: "Create quotes table",
          success: false,
          error: "Table does not exist - manual setup required",
        })
      } else {
        results.push({
          operation: "Check quotes table",
          success: true,
        })
      }
    } catch (err: any) {
      results.push({
        operation: "Setup quotes table",
        success: false,
        error: err.message,
      })
    }

    // Setup storage buckets
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (!bucketsError && buckets) {
        const preventiviBucketExists = buckets.some((bucket) => bucket.name === "preventivi")
        if (!preventiviBucketExists) {
          const { error: createBucketError } = await supabase.storage.createBucket("preventivi", {
            public: false,
            fileSizeLimit: 10485760,
          })

          results.push({
            operation: "Create preventivi bucket",
            success: !createBucketError,
            error: createBucketError?.message,
          })
        } else {
          results.push({
            operation: "Check preventivi bucket",
            success: true,
          })
        }

        const logosBucketExists = buckets.some((bucket) => bucket.name === "logos")
        if (!logosBucketExists) {
          const { error: createBucketError } = await supabase.storage.createBucket("logos", {
            public: true,
            fileSizeLimit: 5242880,
          })

          results.push({
            operation: "Create logos bucket",
            success: !createBucketError,
            error: createBucketError?.message,
          })
        } else {
          results.push({
            operation: "Check logos bucket",
            success: true,
          })
        }
      }
    } catch (err: any) {
      results.push({
        operation: "Setup storage buckets",
        success: false,
        error: err.message,
      })
    }

    const anyFailures = results.some((result) => !result.success)
    const needsManualSetup = results.some((result) => result.error?.includes("does not exist"))

    if (needsManualSetup) {
      return NextResponse.json({
        success: false,
        message: "Database tables need to be created manually",
        needsManualSetup: true,
        sqlScript: getManualSetupSQL(),
        details: results,
      })
    }

    return NextResponse.json({
      success: !anyFailures,
      message: anyFailures ? "Some operations failed" : "Database setup completed successfully",
      details: results,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        needsManualSetup: true,
        sqlScript: getManualSetupSQL(),
      },
      { status: 500 },
    )
  }
}

function getManualSetupSQL(): string {
  return `-- RIGHELLO CONFIGURATORE - SETUP DATABASE
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
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Setup completato! Ora puoi utilizzare il configuratore.`
}
