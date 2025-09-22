-- Crea il bucket per le immagini dei pacchetti se non esiste
DO $$
BEGIN
    -- Inserisci il bucket se non esiste
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'package-images',
        'package-images', 
        true,
        5242880, -- 5MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Verifica che il bucket sia stato creato
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'package-images') THEN
        RAISE NOTICE 'Bucket package-images created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create bucket package-images';
    END IF;
END $$;

-- Elimina le policy esistenti se ci sono
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Crea le policy per il bucket
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'package-images');

CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'package-images');

CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'package-images');

-- Verifica che le policy siano state create
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
