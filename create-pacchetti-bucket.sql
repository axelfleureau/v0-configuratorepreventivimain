-- Crea il bucket pacchetti se non esiste
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pacchetti',
  'pacchetti', 
  true,
  5242880,
  ARRAY['image/*']
) ON CONFLICT (id) DO NOTHING;

-- Imposta policy per permettere upload pubblico
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'pacchetti_upload_policy',
  'pacchetti',
  'Allow public uploads',
  'true',
  'true',
  'INSERT'
) ON CONFLICT (id) DO NOTHING;

-- Imposta policy per permettere lettura pubblica
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'pacchetti_select_policy', 
  'pacchetti',
  'Allow public access',
  'true',
  'true',
  'SELECT'
) ON CONFLICT (id) DO NOTHING;

-- Imposta policy per permettere eliminazione
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'pacchetti_delete_policy', 
  'pacchetti',
  'Allow public deletes',
  'true',
  'true',
  'DELETE'
) ON CONFLICT (id) DO NOTHING;

-- Verifica che il bucket sia stato creato
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'pacchetti';
