import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Server-side environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      return NextResponse.json({ success: false, message: "NEXT_PUBLIC_SUPABASE_URL is not defined" }, { status: 500 })
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: "No valid Supabase key found (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)" },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Execute the services table creation SQL
    const createServicesSQL = `
-- Create services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cycle TEXT NOT NULL CHECK (cycle IN ('one-off', 'monthly')),
  category TEXT,
  service_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_package_id ON public.services(package_id);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' 
    AND policyname = 'Allow public read access to services'
  ) THEN
    CREATE POLICY "Allow public read access to services" ON public.services
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' 
    AND policyname = 'Allow authenticated users to manage services'
  ) THEN
    CREATE POLICY "Allow authenticated users to manage services" ON public.services
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;
    `

    // First, ensure packages table exists and has data
    const { data: packagesExist } = await supabase.from("packages").select("id").limit(1)

    if (!packagesExist || packagesExist.length === 0) {
      // Create and seed packages table first
      const createPackagesSQL = `
-- Create packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.packages (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descrizione TEXT,
  prezzo NUMERIC(10,2) NOT NULL DEFAULT 0,
  posizione INTEGER DEFAULT 0,
  attivo BOOLEAN DEFAULT true,
  servizi_inclusi TEXT[],
  features TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default packages
INSERT INTO public.packages (id, nome, descrizione, prezzo, posizione, attivo, servizi_inclusi, features)
VALUES 
  ('basic', 'Pacchetto Base', 'Perfetto per iniziare', 1500, 1, true, ARRAY['website-single', 'hosting-basic', 'seo-basic', 'maintenance-basic'], '["Design responsive", "SSL incluso", "SEO base", "1 anno di dominio"]'),
  ('standard', 'Pacchetto Standard', 'La scelta più popolare', 3500, 2, true, ARRAY['website-multi', 'hosting-business', 'seo-standard', 'maintenance-premium', 'communication_plan', 'ads-basic'], '["Design personalizzato", "Fino a 5 pagine", "SEO avanzato", "Social media base", "Google Ads base"]'),
  ('premium', 'Pacchetto Premium', 'Soluzione completa', 6000, 3, true, ARRAY['website-ecommerce', 'hosting-premium', 'seo-premium', 'maintenance-premium-plus', 'communication_plan_advanced', 'ads-premium', 'shooting-premium', 'crm-basic'], '["E-commerce completo", "SEO premium", "Social media avanzato", "Google Ads premium", "Shooting fotografico", "CRM integrato"]')
ON CONFLICT (id) DO NOTHING;
      `

      // Execute packages creation
      await supabase.rpc("exec", { sql: createPackagesSQL }).catch(() => {
        // Fallback: try to execute directly (this might not work on all Supabase setups)
        console.log("Note: Could not execute packages SQL via RPC")
      })
    }

    // Execute services table creation
    await supabase.rpc("exec", { sql: createServicesSQL }).catch(() => {
      // Fallback: try to execute directly
      console.log("Note: Could not execute services SQL via RPC")
    })

    // Check if services table exists now
    const { error: servicesCheckError } = await supabase.from("services").select("id").limit(1)

    if (!servicesCheckError) {
      // Table exists, check if it needs seeding
      const { data: servicesData } = await supabase.from("services").select("id").limit(1)

      if (!servicesData || servicesData.length === 0) {
        // Seed the services table
        const { data: packages } = await supabase.from("packages").select("id")

        if (packages && packages.length > 0) {
          const servicesToInsert = []

          const basicPkgId = packages.find((p) => p.id === "basic")?.id
          const standardPkgId = packages.find((p) => p.id === "standard")?.id
          const premiumPkgId = packages.find((p) => p.id === "premium")?.id

          if (basicPkgId) {
            servicesToInsert.push(
              {
                package_id: basicPkgId,
                name: "Sito Web Base",
                description: "Sito web monopagina responsive",
                price: 1000,
                cycle: "one-off",
                category: "website",
                service_id: "website-single",
              },
              {
                package_id: basicPkgId,
                name: "Hosting Base",
                description: "Hosting condiviso con SSL",
                price: 25,
                cycle: "monthly",
                category: "management",
                service_id: "hosting-basic",
              },
            )
          }

          if (standardPkgId) {
            servicesToInsert.push(
              {
                package_id: standardPkgId,
                name: "Sito Web Multipagina",
                description: "Sito web completo fino a 5 pagine",
                price: 2500,
                cycle: "one-off",
                category: "website",
                service_id: "website-multi",
              },
              {
                package_id: standardPkgId,
                name: "Piano Comunicazione Base",
                description: "Gestione social media base",
                price: 300,
                cycle: "monthly",
                category: "communication",
                service_id: "communication_plan",
              },
            )
          }

          if (servicesToInsert.length > 0) {
            const { error: insertError } = await supabase.from("services").insert(servicesToInsert)
            if (insertError) {
              console.error("Error inserting services:", insertError)
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Database initialized successfully",
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Services table could not be created",
        error: servicesCheckError.message,
        sqlScript: createServicesSQL,
      })
    }
  } catch (error: any) {
    console.error("Error during database initialization:", error)
    return NextResponse.json({ success: false, message: error.message || "Unknown error" }, { status: 500 })
  }
}
