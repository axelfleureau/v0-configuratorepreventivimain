export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      packages: {
        Row: {
          id: string
          nome: string
          descrizione: string
          prezzo: number
          posizione: number
          features: Json | null
          servizi_inclusi: Json | null
          attivo: boolean | null
          creato_il: string | null
          aggiornato_il: string | null
          border_color: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          nome: string
          descrizione?: string
          prezzo: number
          posizione: number
          features?: Json | null
          servizi_inclusi?: Json | null
          attivo?: boolean | null
          creato_il?: string | null
          aggiornato_il?: string | null
          border_color?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          nome?: string
          descrizione?: string
          prezzo?: number
          posizione?: number
          features?: Json | null
          servizi_inclusi?: Json | null
          attivo?: boolean | null
          creato_il?: string | null
          aggiornato_il?: string | null
          border_color?: string | null
          image_url?: string | null
        }
      }
      quotes: {
        Row: {
          id: string
          client_name: string
          client_email: string
          client_phone: string
          client_company: string | null
          package_id: string | null
          selected_services: Json
          total_price: number
          created_at: string
          pdf_url: string | null
        }
        Insert: {
          id?: string
          client_name: string
          client_email: string
          client_phone: string
          client_company?: string | null
          package_id?: string | null
          selected_services: Json
          total_price: number
          created_at?: string
          pdf_url?: string | null
        }
        Update: {
          id?: string
          client_name?: string
          client_email?: string
          client_phone?: string
          client_company?: string | null
          package_id?: string | null
          selected_services?: Json
          total_price?: number
          created_at?: string
          pdf_url?: string | null
        }
      }
      company_settings: {
        Row: {
          id: number
          name: string
          vat_number: string
          email: string
          phone: string
          address: string
          website: string
          primary_color: string
          main_logo_url: string | null
          square_logo_url: string | null
        }
        Insert: {
          id?: number
          name: string
          vat_number: string
          email: string
          phone: string
          address: string
          website: string
          primary_color: string
          main_logo_url?: string | null
          square_logo_url?: string | null
        }
        Update: {
          id?: number
          name?: string
          vat_number?: string
          email?: string
          phone?: string
          address?: string
          website?: string
          primary_color?: string
          main_logo_url?: string | null
          square_logo_url?: string | null
        }
      }
    }
  }
}
