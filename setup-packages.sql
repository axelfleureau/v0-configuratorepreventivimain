-- Insert default packages if they don't exist
INSERT INTO packages (nome, descrizione, prezzo, posizione, attivo, features, servizi_inclusi)
VALUES 
  (
    'Basic Package',
    'Essential digital services for small businesses',
    1500,
    1,
    true,
    '["Responsive website", "Basic SEO", "Monthly maintenance"]'::jsonb,
    '{
      "website": [{"id": "website-basic", "name": "Basic Website"}],
      "seo": [{"id": "seo-basic", "name": "Basic SEO"}],
      "management": [{"id": "management-basic", "name": "Basic Management"}]
    }'::jsonb
  ),
  (
    'Standard Package',
    'Comprehensive digital services for growing businesses',
    3000,
    2,
    true,
    '["Professional website", "Advanced SEO", "Social media management", "Monthly reports"]'::jsonb,
    '{
      "website": [{"id": "website-standard", "name": "Standard Website"}],
      "seo": [{"id": "seo-standard", "name": "Standard SEO"}],
      "management": [{"id": "management-standard", "name": "Standard Management"}],
      "communication": [{"id": "communication-basic", "name": "Basic Communication Plan"}],
      "advertising": [{"id": "advertising-basic", "name": "Basic Advertising"}]
    }'::jsonb
  ),
  (
    'Premium Package',
    'Complete digital transformation for established businesses',
    5000,
    3,
    true,
    '["Custom website", "Full SEO strategy", "Complete marketing", "Priority support", "Analytics"]'::jsonb,
    '{
      "website": [{"id": "website-premium", "name": "Premium Website"}],
      "seo": [{"id": "seo-premium", "name": "Premium SEO"}],
      "management": [{"id": "management-premium", "name": "Premium Management"}],
      "communication": [{"id": "communication-standard", "name": "Standard Communication Plan"}],
      "advertising": [{"id": "advertising-standard", "name": "Standard Advertising"}],
      "photoVideo": [{"id": "photoVideo-basic", "name": "Basic Photo/Video"}],
      "crmSige": [{"id": "crmSige-basic", "name": "Basic CRM/SIGE"}]
    }'::jsonb
  )
ON CONFLICT (nome) DO NOTHING;
