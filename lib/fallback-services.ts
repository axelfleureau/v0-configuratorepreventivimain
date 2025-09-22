// Fallback services data to use when the database table doesn't exist
export const fallbackServices = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    package_id: null,
    name: "Basic maintenance",
    price: 150,
    cycle: "monthly",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    package_id: null,
    name: "SEO monitoring",
    price: 200,
    cycle: "monthly",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    package_id: null,
    name: "One-shot landing",
    price: 800,
    cycle: "one-off",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    package_id: null,
    name: "Social Media Management",
    price: 300,
    cycle: "monthly",
    created_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    package_id: null,
    name: "Content Creation",
    price: 250,
    cycle: "monthly",
    created_at: new Date().toISOString(),
  },
]
