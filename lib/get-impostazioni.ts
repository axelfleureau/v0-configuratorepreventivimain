import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function getImpostazioni() {
  const supabase = createClientComponentClient()

  try {
    const { data, error } = await supabase.from("company_settings").select("*").single()

    if (error) {
      console.warn("Could not fetch company settings:", error)
      return {
        colore_primario: "#ff0092",
        info_azienda: {
          nome: "Righello",
          piva: "",
          email: "info@righello.com",
          telefono: "+39 123 456 7890",
          indirizzo: "Via Example 123, 12345 City",
        },
        logo_url: null,
      }
    }

    return {
      colore_primario: data.primary_color,
      info_azienda: {
        nome: data.name,
        piva: data.vat_number,
        email: data.email,
        telefono: data.phone,
        indirizzo: data.address,
      },
      logo_url: data.main_logo_url ? { url: data.main_logo_url } : null,
    }
  } catch (error) {
    console.error("Error in getImpostazioni:", error)
    return {
      colore_primario: "#ff0092",
      info_azienda: {
        nome: "Righello",
        piva: "",
        email: "info@righello.com",
        telefono: "+39 123 456 7890",
        indirizzo: "Via Example 123, 12345 City",
      },
      logo_url: null,
    }
  }
}
