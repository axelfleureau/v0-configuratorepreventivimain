-- Create services table for package services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  cycle TEXT CHECK (cycle IN ('one-off', 'monthly')) NOT NULL DEFAULT 'one-off',
  category TEXT,
  service_id TEXT, -- Reference to the service option ID in the static data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_package_id ON public.services(package_id);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to services" ON public.services
  FOR SELECT USING (true);

-- Create policy for authenticated users to manage services
CREATE POLICY "Allow authenticated users to manage services" ON public.services
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial services for existing packages
DO $$
DECLARE
  basic_pkg_id UUID;
  standard_pkg_id UUID;
  premium_pkg_id UUID;
BEGIN
  -- Get package IDs
  SELECT id INTO basic_pkg_id FROM public.packages WHERE id = 'basic' LIMIT 1;
  SELECT id INTO standard_pkg_id FROM public.packages WHERE id = 'standard' LIMIT 1;
  SELECT id INTO premium_pkg_id FROM public.packages WHERE id = 'premium' LIMIT 1;

  -- Insert services for Basic Package
  IF basic_pkg_id IS NOT NULL THEN
    INSERT INTO public.services (package_id, name, description, price, cycle, category, service_id) VALUES
      (basic_pkg_id, 'Sito Web Base', 'Sito web monopagina responsive', 1000, 'one-off', 'website', 'website-single'),
      (basic_pkg_id, 'Hosting Base', 'Hosting condiviso con SSL', 25, 'monthly', 'management', 'hosting-basic'),
      (basic_pkg_id, 'SEO Base', 'Ottimizzazione SEO di base', 500, 'one-off', 'seo', 'seo-basic'),
      (basic_pkg_id, 'Manutenzione Base', 'Aggiornamenti mensili', 150, 'monthly', 'management', 'maintenance-basic')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert services for Standard Package
  IF standard_pkg_id IS NOT NULL THEN
    INSERT INTO public.services (package_id, name, description, price, cycle, category, service_id) VALUES
      (standard_pkg_id, 'Sito Web Multipagina', 'Sito web completo fino a 5 pagine', 2500, 'one-off', 'website', 'website-multi'),
      (standard_pkg_id, 'Hosting Business', 'Hosting ottimizzato per business', 50, 'monthly', 'management', 'hosting-business'),
      (standard_pkg_id, 'SEO Standard', 'Ottimizzazione SEO avanzata', 800, 'one-off', 'seo', 'seo-standard'),
      (standard_pkg_id, 'Manutenzione Premium', 'Aggiornamenti settimanali e supporto', 250, 'monthly', 'management', 'maintenance-premium'),
      (standard_pkg_id, 'Piano Comunicazione Base', 'Gestione social media base', 300, 'monthly', 'communication', 'communication_plan'),
      (standard_pkg_id, 'Google Ads Base', 'Campagne pubblicitarie base', 200, 'monthly', 'advertising', 'ads-basic')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert services for Premium Package
  IF premium_pkg_id IS NOT NULL THEN
    INSERT INTO public.services (package_id, name, description, price, cycle, category, service_id) VALUES
      (premium_pkg_id, 'Sito Web E-commerce', 'E-commerce completo con gestione prodotti', 3500, 'one-off', 'website', 'website-ecommerce'),
      (premium_pkg_id, 'Hosting Premium', 'Hosting ad alte prestazioni', 100, 'monthly', 'management', 'hosting-premium'),
      (premium_pkg_id, 'SEO Premium', 'SEO completo con reportistica', 1200, 'one-off', 'seo', 'seo-premium'),
      (premium_pkg_id, 'Manutenzione Premium', 'Supporto completo 24/7', 250, 'monthly', 'management', 'maintenance-premium'),
      (premium_pkg_id, 'Piano Comunicazione Avanzato', 'Gestione social media completa', 800, 'monthly', 'communication', 'communication_plan'),
      (premium_pkg_id, 'Google Ads Premium', 'Campagne pubblicitarie avanzate', 500, 'monthly', 'advertising', 'ads-premium'),
      (premium_pkg_id, 'Shooting Fotografico', 'Servizio fotografico professionale', 500, 'one-off', 'photoVideo', 'shooting-premium'),
      (premium_pkg_id, 'CRM Base', 'Sistema CRM integrato', 150, 'monthly', 'crmSige', 'crm-basic')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert seed data (ignore if already exists)
  INSERT INTO public.services (package_id, name, price, cycle)
  VALUES
    (null, 'Basic maintenance', 150, 'monthly'),
    (null, 'SEO monitoring', 200, 'monthly'),
    (null, 'One-shot landing', 800, 'one-off')
  ON CONFLICT DO NOTHING;
END $$;
