-- This is the complete database setup script including the services table

-- ... existing tables ...

-- Create services table for package services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
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
