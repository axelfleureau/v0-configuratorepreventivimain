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

-- Setup completato! Ora puoi utilizzare il configuratore.
