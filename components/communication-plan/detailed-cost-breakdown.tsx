"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { BarChart3, PieChartIcon } from "lucide-react"

interface CostItem {
  category: string
  name: string
  oneTimeCost: number
  monthlyCost: number
  color: string
}

interface DetailedCostBreakdownProps {
  costItems: CostItem[]
  includeVAT: boolean
}

const COLORS = {
  website: "#8b5cf6",
  social: "#ff0092",
  seo: "#10b981",
  branding: "#f59e0b",
  media: "#ef4444",
  advertising: "#3b82f6",
  other: "#6b7280",
}

export function DetailedCostBreakdown({ costItems, includeVAT }: DetailedCostBreakdownProps) {
  const [activeView, setActiveView] = useState<"oneTime" | "monthly">("oneTime")

  const vatMultiplier = includeVAT ? 1.22 : 1

  const getChartData = (type: "oneTime" | "monthly") => {
    const categoryTotals = costItems.reduce(
      (acc, item) => {
        const cost = type === "oneTime" ? item.oneTimeCost : item.monthlyCost
        if (cost > 0) {
          acc[item.category] = (acc[item.category] || 0) + cost * vatMultiplier
        }
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categoryTotals).map(([category, value]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: Math.round(value),
      color: COLORS[category as keyof typeof COLORS] || COLORS.other,
    }))
  }

  const oneTimeData = getChartData("oneTime")
  const monthlyData = getChartData("monthly")

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-[#ff0092] numeric-value">€{data.value.toLocaleString("it-IT")}</p>
        </div>
      )
    }
    return null
  }

  const getCategoryItems = (category: string, type: "oneTime" | "monthly") => {
    return costItems.filter((item) => {
      const cost = type === "oneTime" ? item.oneTimeCost : item.monthlyCost
      return item.category === category && cost > 0
    })
  }

  const totalOneTime = oneTimeData.reduce((sum, item) => sum + item.value, 0)
  const totalMonthly = monthlyData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#ff0092]" />
          Analisi Dettagliata Costi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={(value: "oneTime" | "monthly") => setActiveView(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="oneTime" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Una Tantum (€{totalOneTime.toLocaleString("it-IT")})
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Mensili (€{totalMonthly.toLocaleString("it-IT")})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oneTime" className="space-y-4">
            {oneTimeData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={oneTimeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {oneTimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <Accordion type="single" collapsible>
                  {oneTimeData.map((categoryData) => {
                    const categoryItems = getCategoryItems(categoryData.name.toLowerCase(), "oneTime")
                    return (
                      <AccordionItem key={categoryData.name} value={categoryData.name}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoryData.color }} />
                            <span>{categoryData.name}</span>
                            <Badge variant="outline" className="numeric-value">
                              €{categoryData.value.toLocaleString("it-IT")}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {categoryItems.map((item, index) => (
                              <div key={index} className="flex justify-between items-center py-1">
                                <span className="text-sm">{item.name}</span>
                                <span className="font-medium numeric-value">
                                  €{Math.round(item.oneTimeCost * vatMultiplier).toLocaleString("it-IT")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">Nessun costo una tantum configurato</div>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            {monthlyData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {monthlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <Accordion type="single" collapsible>
                  {monthlyData.map((categoryData) => {
                    const categoryItems = getCategoryItems(categoryData.name.toLowerCase(), "monthly")
                    return (
                      <AccordionItem key={categoryData.name} value={categoryData.name}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoryData.color }} />
                            <span>{categoryData.name}</span>
                            <Badge variant="outline" className="numeric-value">
                              €{categoryData.value.toLocaleString("it-IT")}/mese
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {categoryItems.map((item, index) => (
                              <div key={index} className="flex justify-between items-center py-1">
                                <span className="text-sm">{item.name}</span>
                                <span className="font-medium numeric-value">
                                  €{Math.round(item.monthlyCost * vatMultiplier).toLocaleString("it-IT")}/mese
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">Nessun costo mensile configurato</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
