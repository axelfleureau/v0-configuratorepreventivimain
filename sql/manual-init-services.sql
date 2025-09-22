-- MANUAL INITIALIZATION SQL
-- If automatic initialization fails, copy and run this SQL in your Supabase SQL Editor

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id  uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  name        text NOT NULL,
  price       numeric NOT NULL,
  cycle       text NOT NULL CHECK (cycle IN ('one-off','monthly')),
  created_at  timestamp with time zone DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_services_package_id ON public.services(package_id);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (true);

-- Insert seed data
INSERT INTO public.services (package_id, name, price, cycle)
VALUES
  (null, 'Basic maintenance', 150, 'monthly'),
  (null, 'SEO monitoring', 200, 'monthly'),
  (null, 'One-shot landing', 800, 'one-off'),
  (null, 'Social Media Management', 300, 'monthly'),
  (null, 'Content Creation', 250, 'monthly'),
  (null, 'Email Marketing', 180, 'monthly'),
  (null, 'Website Redesign', 1500, 'one-off'),
  (null, 'Logo Design', 500, 'one-off'),
  (null, 'Brand Guidelines', 1200, 'one-off')
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT COUNT(*) as service_count FROM public.services;
