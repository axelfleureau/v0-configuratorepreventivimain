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
CREATE POLICY "Allow public read access to services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage services" ON public.services
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert seed data only if table is empty
INSERT INTO public.services (package_id, name, description, price, cycle, category, service_id)
SELECT 
  p.id,
  s.name,
  s.description,
  s.price,
  s.cycle,
  s.category,
  s.service_id
FROM (
  VALUES 
    -- Basic package services
    ('basic', 'Sito Web Base', 'Sito web monopagina responsive', 1000, 'one-off', 'website', 'website-single'),
    ('basic', 'Hosting Base', 'Hosting condiviso con SSL', 25, 'monthly', 'management', 'hosting-basic'),
    ('basic', 'SEO Base', 'Ottimizzazione SEO di base', 500, 'one-off', 'seo', 'seo-basic'),
    ('basic', 'Manutenzione Base', 'Aggiornamenti mensili', 150, 'monthly', 'management', 'maintenance-basic'),
    
    -- Standard package services
    ('standard', 'Sito Web Multipagina', 'Sito web completo fino a 5 pagine', 2500, 'one-off', 'website', 'website-multi'),
    ('standard', 'Hosting Business', 'Hosting ottimizzato per business', 50, 'monthly', 'management', 'hosting-business'),
    ('standard', 'SEO Standard', 'Ottimizzazione SEO avanzata', 800, 'one-off', 'seo', 'seo-standard'),
    ('standard', 'Manutenzione Premium', 'Aggiornamenti settimanali e supporto', 250, 'monthly', 'management', 'maintenance-premium'),
    ('standard', 'Piano Comunicazione Base', 'Gestione social media base', 300, 'monthly', 'communication', 'communication_plan'),
    ('standard', 'Google Ads Base', 'Campagne pubblicitarie base', 200, 'monthly', 'advertising', 'ads-basic'),
    
    -- Premium package services
    ('premium', 'Sito Web E-commerce', 'E-commerce completo con gestione prodotti', 3500, 'one-off', 'website', 'website-ecommerce'),
    ('premium', 'Hosting Premium', 'Hosting ad alte prestazioni', 100, 'monthly', 'management', 'hosting-premium'),
    ('premium', 'SEO Premium', 'SEO completo con reportistica', 1200, 'one-off', 'seo', 'seo-premium'),
    ('premium', 'Manutenzione Premium Plus', 'Supporto completo 24/7', 350, 'monthly', 'management', 'maintenance-premium-plus'),
    ('premium', 'Piano Comunicazione Avanzato', 'Gestione social media completa', 800, 'monthly', 'communication', 'communication_plan_advanced'),
    ('premium', 'Google Ads Premium', 'Campagne pubblicitarie avanzate', 500, 'monthly', 'advertising', 'ads-premium'),
    ('premium', 'Shooting Fotografico', 'Servizio fotografico professionale', 500, 'one-off', 'photoVideo', 'shooting-premium'),
    ('premium', 'CRM Base', 'Sistema CRM integrato', 150, 'monthly', 'crmSige', 'crm-basic')
) AS s(package_name, name, description, price, cycle, category, service_id)
JOIN public.packages p ON p.id = s.package_name
WHERE NOT EXISTS (SELECT 1 FROM public.services LIMIT 1);
