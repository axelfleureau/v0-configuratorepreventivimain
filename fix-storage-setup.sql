-- Prima eliminiamo eventuali policy esistenti
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Eliminiamo il bucket se esiste per ricrearlo
DELETE FROM storage.buckets WHERE id = 'package-images';

-- Creiamo il bucket correttamente
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'package-images',
    'package-images', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
);

-- Creiamo le policy corrette
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'package-images');

CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'package-images');

CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'package-images');

-- Verifica che tutto sia stato creato
SELECT 
    b.id as bucket_id,
    b.name,
    b.public,
    b.file_size_limit,
    b.allowed_mime_types
FROM storage.buckets b 
WHERE b.id = 'package-images';
