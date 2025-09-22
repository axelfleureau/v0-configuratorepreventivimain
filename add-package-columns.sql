-- Aggiungi le colonne mancanti alla tabella packages
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS border_color VARCHAR(7) DEFAULT '#ff0092',
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Aggiorna i pacchetti esistenti con colori predefiniti
UPDATE packages SET border_color = '#ff0092' WHERE border_color IS NULL;

-- Verifica che le colonne siano state create
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'packages' 
AND column_name IN ('border_color', 'image_url');
