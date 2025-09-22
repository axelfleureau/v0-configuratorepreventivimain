"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Share2, Search, Palette, Camera, Megaphone } from "lucide-react"

const serviceCategories = [
  {
    id: "website",
    title: "Website",
    icon: Globe,
    description: "Sviluppo e manutenzione siti web",
    oneTime: "€1.000 - €5.000",
    monthly: "€100 - €500",
    examples: ["Sviluppo sito", "Restyling", "E-commerce", "Manutenzione", "Hosting"],
  },
  {
    id: "social",
    title: "Social Media",
    icon: Share2,
    description: "Gestione e strategia social media",
    oneTime: "€500 - €2.000",
    monthly: "€300 - €1.600",
    examples: ["Setup account", "Strategia iniziale", "Gestione mensile", "Content creation", "Community management"],
  },
  {
    id: "seo",
    title: "SEO",
    icon: Search,
    description: "Ottimizzazione per motori di ricerca",
    oneTime: "€800 - €3.000",
    monthly: "€200 - €1.000",
    examples: ["Audit SEO", "Ottimizzazione tecnica", "Monitoraggio mensile", "Link building", "Content SEO"],
  },
  {
    id: "branding",
    title: "Branding",
    icon: Palette,
    description: "Identità visiva e brand strategy",
    oneTime: "€1.200 - €5.000",
    monthly: "€0 - €300",
    examples: ["Logo design", "Brand identity", "Guidelines", "Restyling", "Brand monitoring"],
  },
  {
    id: "media",
    title: "Media",
    icon: Camera,
    description: "Produzione foto e video",
    oneTime: "€500 - €3.000",
    monthly: "€200 - €800",
    examples: ["Shooting fotografico", "Video promozionali", "Editing mensile", "Stock photos", "Animazioni"],
  },
  {
    id: "advertising",
    title: "Advertising",
    icon: Megaphone,
    description: "Campagne pubblicitarie digitali",
    oneTime: "€300 - €1.500",
    monthly: "€500 - €3.000",
    examples: ["Setup campagne", "Strategia ads", "Gestione mensile", "A/B testing", "Reporting"],
  },
]

export function ServiceCategoryExplanation() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-[#ff0092]" />
          Categorie di Servizio
        </CardTitle>
        <CardDescription>Comprendi la differenza tra costi una tantum e mensili per ogni categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {serviceCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-[#ff0092]" />
                    <div className="text-left">
                      <div className="font-semibold">{category.title}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Una Tantum</Badge>
                        <span className="font-semibold numeric-value">{category.oneTime}</span>
                      </div>
                      <p className="text-sm text-gray-600">Costi iniziali per setup, sviluppo e implementazione</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Mensile</Badge>
                        <span className="font-semibold numeric-value">{category.monthly}</span>
                      </div>
                      <p className="text-sm text-gray-600">Costi ricorrenti per gestione e manutenzione</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Esempi di servizi:</h4>
                    <div className="flex flex-wrap gap-1">
                      {category.examples.map((example, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}
