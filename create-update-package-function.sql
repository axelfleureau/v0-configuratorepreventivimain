-- Crea una funzione per aggiornare i pacchetti in modo sicuro
CREATE OR REPLACE FUNCTION update_package(
  package_id UUID,
  package_data JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE packages 
  SET 
    nome = COALESCE((package_data->>'nome')::TEXT, nome),
    descrizione = COALESCE((package_data->>'descrizione')::TEXT, descrizione),
    prezzo = COALESCE((package_data->>'prezzo')::NUMERIC, prezzo),
    posizione = COALESCE((package_data->>'posizione')::INTEGER, posizione),
    servizi_inclusi = COALESCE(package_data->'servizi_inclusi', servizi_inclusi),
    attivo = COALESCE((package_data->>'attivo')::BOOLEAN, attivo),
    aggiornato_il = COALESCE((package_data->>'aggiornato_il')::TIMESTAMPTZ, aggiornato_il),
    border_color = COALESCE((package_data->>'border_color')::TEXT, border_color),
    image_url = COALESCE((package_data->>'image_url')::TEXT, image_url)
  WHERE id = package_id;
END;
$$ LANGUAGE plpgsql;
