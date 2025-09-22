-- Aggiorna la tabella quotes per includere la data di emissione e il costo mensile
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS monthly_price NUMERIC DEFAULT 0;

-- Crea un indice per le ricerche per data di emissione
CREATE INDEX IF NOT EXISTS idx_quotes_issue_date ON public.quotes(issue_date DESC);
