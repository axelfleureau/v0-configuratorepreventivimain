"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import useSWR from "swr"

// Use static data as fallback
import { serviceOptions, servicePackages } from "@/data/services-data"

// Fallback services data
const fallbackServices = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    package_id: null,
    name: "Basic maintenance",
    price: 150,
    cycle: "monthly",
    created_at: new Date().toISOString(),
    description: "Regular website maintenance and updates",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    package_id: null,
    name: "SEO monitoring",
    price: 200,
    cycle: "monthly",
    created_at: new Date().toISOString(),
    description: "Monthly SEO performance tracking and reporting",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    package_id: null,
    name: "One-shot landing",
    price: 800,
    cycle: "one-off",
    created_at: new Date().toISOString(),
    description: "Custom landing page design and development",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    package_id: null,
    name: "Social Media Management",
    price: 300,
    cycle: "monthly",
    created_at: new Date().toISOString(),
    description: "Full-service social media content and engagement",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    package_id: null,
    name: "Content Creation",
    price: 250,
    cycle: "monthly",
    created_at: new Date().toISOString(),
    description: "Regular blog posts and website content updates",
  },
]

interface Package {
  id: string
  nome: string
  descrizione: string
  prezzo: number
  posizione: number
  attivo: boolean
  servizi_inclusi: string[]
  features: string | string[] | null
}

interface Service {
  id: number | string
  package_id: number | string | null
  name: string
  description: string | null
  price: number
  cycle: "one-off" | "monthly"
  created_at: string
}

// Fallback to static data
const staticPackages = servicePackages.map((pkg) => ({
  id: pkg.id,
  nome: pkg.name,
  descrizione: pkg.description,
  prezzo: pkg.basePrice,
  posizione: 0,
  attivo: true,
  servizi_inclusi: pkg.includedServices || [],
  features: pkg.features || [],
}))

const fetchPackages = async () => {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("attivo", true)
      .order("posizione", { ascending: true })

    if (error) {
      console.error("Error fetching packages:", error)
      // Try with different column name
      const { data: altData, error: altError } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (altError) {
        console.error("Alternative fetch also failed:", altError)
        return staticPackages // Return static data as fallback
      }

      return altData || staticPackages
    }

    // Process features field
    const processedData = data?.map((pkg) => ({
      ...pkg,
      features:
        typeof pkg.features === "string"
          ? (() => {
              try {
                return JSON.parse(pkg.features)
              } catch {
                return pkg.features
              }
            })()
          : pkg.features,
    }))

    return processedData || staticPackages
  } catch (error) {
    console.error("Unexpected error fetching packages:", error)
    return staticPackages
  }
}

// Generate static services from serviceOptions
const generateStaticServices = () => {
  const services: Service[] = []
  let id = 1

  servicePackages.forEach((pkg) => {
    pkg.includedServices.forEach((serviceId) => {
      // Find the service in serviceOptions
      for (const [category, options] of Object.entries(serviceOptions)) {
        const option = options.find((opt) => opt.id === serviceId)
        if (option) {
          const isMonthly = category === "communication" || category === "management" || serviceId.includes("monthly")
          services.push({
            id: id++,
            package_id: Number.parseInt(pkg.id),
            name: option.name,
            description: option.description,
            price: isMonthly ? option.priceMonthly || 0 : option.priceOneTime || 0,
            cycle: isMonthly ? "monthly" : "one-off",
            created_at: new Date().toISOString(),
          })
          break
        }
      }
    })
  })

  return services
}

const staticServices = generateStaticServices()

const fetchServices = async () => {
  try {
    const supabase = getSupabaseClient()

    // Check if the services table exists by attempting to query it
    const { data, error } = await supabase.from("services").select("*")

    if (error) {
      // If the error is about the relation not existing, log it but don't treat as fatal
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.warn("Services table does not exist, using fallback data")

        // Log the SQL needed to create the table
        console.info(`
To create the services table, run this SQL in your Supabase dashboard:

CREATE TABLE IF NOT EXISTS services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id  uuid REFERENCES packages(id) ON DELETE CASCADE,
  name        text NOT NULL,
  price       numeric NOT NULL,
  cycle       text NOT NULL CHECK (cycle IN ('one-off','monthly')),
  created_at  timestamp with time zone DEFAULT now()
);

INSERT INTO services (package_id, name, price, cycle)
VALUES
  (null, 'Basic maintenance', 150, 'monthly'),
  (null, 'SEO monitoring', 200, 'monthly'),
  (null, 'One-shot landing', 800, 'one-off')
ON CONFLICT DO NOTHING;
        `)

        // Return the fallback services
        return fallbackServices
      }

      // For other errors, log and return static data
      console.error("Error fetching services:", error)
      return staticServices
    }

    return data && data.length > 0 ? data : fallbackServices
  } catch (error) {
    console.error("Unexpected error fetching services:", error)
    return fallbackServices
  }
}

export function useRealTimePackages() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const [tableExists, setTableExists] = useState(true)

  // Fetch packages with SWR
  const {
    data: packages,
    error: packagesError,
    isLoading: isLoadingPackages,
    isValidating: isValidatingPackages,
    mutate: mutatePackages,
  } = useSWR("packages", fetchPackages, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    onError: () => {
      setUsingFallback(true)
    },
  })

  // Fetch services with SWR
  const {
    data: services,
    error: servicesError,
    isLoading: isLoadingServices,
    isValidating: isValidatingServices,
    mutate: mutateServices,
  } = useSWR("services", fetchServices, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    onError: (err) => {
      if (err.message.includes("relation") && err.message.includes("does not exist")) {
        setTableExists(false)
      }
      setUsingFallback(true)
    },
  })

  useEffect(() => {
    if (usingFallback || !tableExists) return // Don't set up subscriptions if using fallback or table doesn't exist

    const supabase = getSupabaseClient()

    // Try to set up subscriptions
    try {
      // Subscribe to packages changes
      const packagesSubscription = supabase
        .channel("packages-changes")
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
            schema: "public",
            table: "packages",
          },
          () => {
            // Revalidate the packages cache
            mutatePackages()
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsSubscribed(true)
          }
        })

      // Subscribe to services changes only if the table exists
      let servicesSubscription = null
      if (tableExists) {
        servicesSubscription = supabase
          .channel("services-changes")
          .on(
            "postgres_changes",
            {
              event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
              schema: "public",
              table: "services",
            },
            () => {
              // Revalidate the services cache
              mutateServices()
            },
          )
          .subscribe()
      }

      // Cleanup subscriptions
      return () => {
        supabase.removeChannel(packagesSubscription)
        if (servicesSubscription) {
          supabase.removeChannel(servicesSubscription)
        }
      }
    } catch (error) {
      console.error("Error setting up real-time subscriptions:", error)
      setUsingFallback(true)
    }
  }, [mutatePackages, mutateServices, usingFallback, tableExists])

  const isLoading = isLoadingPackages || isLoadingServices
  const isValidating = isValidatingPackages || isValidatingServices
  const error = packagesError || servicesError

  return {
    packages: packages || staticPackages,
    services: services || fallbackServices,
    isLoading,
    isRefetching: !isLoading && isValidating,
    error,
    isSubscribed,
    usingFallback,
    tableExists,
  }
}
