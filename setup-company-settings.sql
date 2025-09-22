-- Create company_settings table with UUID primary key
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT 'Righello',
  piva TEXT DEFAULT 'P.IVA 12345678901',
  email TEXT DEFAULT 'info@righello.com',
  telefono TEXT DEFAULT '+39 123 456 7890',
  indirizzo TEXT DEFAULT 'Via Example 123, 12345 City',
  website TEXT DEFAULT 'www.righello.com',
  primary_color TEXT DEFAULT '#ff0092',
  main_logo_url TEXT DEFAULT NULL,
  square_logo_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default record if none exists
INSERT INTO public.company_settings (
  nome, 
  piva, 
  email, 
  telefono, 
  indirizzo, 
  website, 
  primary_color
)
SELECT 
  'Righello', 
  'P.IVA 12345678901', 
  'info@righello.com', 
  '+39 123 456 7890',
  'Via Example 123, 12345 City',
  'www.righello.com',
  '#ff0092'
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_settings LIMIT 1
);
