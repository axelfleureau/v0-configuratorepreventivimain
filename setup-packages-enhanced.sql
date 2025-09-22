-- Aggiorna la tabella packages per includere colore border e immagine
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS border_color VARCHAR(7) DEFAULT '#e5e7eb',
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Aggiorna i pacchetti esistenti con colori predefiniti
UPDATE packages SET border_color = '#ff0092' WHERE nome = 'Premium Package';
UPDATE packages SET border_color = '#3b82f6' WHERE nome = 'Standard Package';
UPDATE packages SET border_color = '#10b981' WHERE nome = 'Basic Package';
UPDATE packages SET border_color = '#8b5cf6' WHERE nome = 'Custom Package';

-- Inserisci pacchetti di esempio se non esistono
INSERT INTO packages (id, nome, descrizione, prezzo, posizione, border_color, servizi_inclusi, attivo, creato_il, aggiornato_il)
VALUES 
  ('basic', 'Basic Package', 'Essential digital services for small businesses', 1500, 1, '#10b981', 
   '{"website": [{"id": "website-basic", "name": "Basic Website"}], "seo": [{"id": "seo-basic", "name": "Basic SEO"}], "management": [{"id": "management-basic", "name": "Basic Management"}]}', 
   true, NOW(), NOW()),
  ('standard', 'Standard Package', 'Comprehensive digital services for growing businesses', 3000, 2, '#3b82f6',
   '{"website": [{"id": "website-standard", "name": "Standard Website"}], "seo": [{"id": "seo-standard", "name": "Standard SEO"}], "management": [{"id": "management-standard", "name": "Standard Management"}], "communication": [{"id": "communication-basic", "name": "Basic Communication Plan"}], "advertising": [{"id": "advertising-basic", "name": "Basic Advertising"}]}',
   true, NOW(), NOW()),
  ('premium', 'Premium Package', 'Complete digital transformation for established businesses', 5000, 3, '#ff0092',
   '{"website": [{"id": "website-premium", "name": "Premium Website"}], "seo": [{"id": "seo-premium", "name": "Premium SEO"}], "management": [{"id": "management-premium", "name": "Premium Management"}], "communication": [{"id": "communication-standard", "name": "Standard Communication Plan"}], "advertising": [{"id": "advertising-standard", "name": "Standard Advertising"}], "photoVideo": [{"id": "photoVideo-basic", "name": "Basic Photo/Video"}], "crmSige": [{"id": "crmSige-basic", "name": "Basic CRM/SIGE"}]}',
   true, NOW(), NOW()),
  ('custom', 'Custom Package', 'Tailored digital services based on your specific needs', 0, 4, '#8b5cf6',
   '{}',
   true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  border_color = EXCLUDED.border_color,
  aggiornato_il = NOW();
