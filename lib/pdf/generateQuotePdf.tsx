import type React from "react"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font, Image } from "@react-pdf/renderer"
import type { QuoteData } from "@/types"
import { formatCurrency } from "@/utils/format"

// Register fonts
Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Inter-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/Inter-Bold.ttf", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
    color: "#ff0092",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    color: "#ff0092",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
  },
  tableCol: {
    width: "60%",
    padding: 8,
  },
  tableColPrice: {
    width: "20%",
    padding: 8,
    textAlign: "right",
  },
  tableCellHeader: {
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#666",
    fontSize: 8,
  },
  totalsSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#ff0092",
    fontSize: 14,
    fontWeight: 700,
  },
})

interface QuotePDFProps {
  quote: QuoteData
}

const QuotePDF: React.FC<QuotePDFProps> = ({ quote }) => {
  const oneTimeServices = Object.values(quote.selectedServices)
    .flat()
    .filter((s) => s.priceOneTime && s.priceOneTime > 0)

  const monthlyServices = Object.values(quote.selectedServices)
    .flat()
    .filter((s) => s.priceMonthly && s.priceMonthly > 0)

  const oneTimeTotal = oneTimeServices.reduce((sum, s) => sum + (s.priceOneTime || 0), 0) + quote.transportCost
  const monthlyTotal = monthlyServices.reduce((sum, s) => sum + (s.priceMonthly || 0), 0)
  const yearlyTotal = monthlyTotal * 12
  const discountAmount = yearlyTotal * quote.discountRate
  const discountedYearlyTotal = yearlyTotal - discountAmount

  const vatRate = 0.22
  const oneTimeVat = oneTimeTotal * vatRate
  const yearlyVat = (quote.discountRate > 0 ? discountedYearlyTotal : monthlyTotal) * vatRate
  const monthlyVat = monthlyTotal * vatRate

  const oneTimeTotalIncVat = oneTimeTotal + oneTimeVat
  const monthlyTotalIncVat = monthlyTotal + monthlyVat

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/images/righello_logo.svg" />
          <Text style={styles.title}>Preventivo</Text>
          <Text style={styles.subtitle}>Data: {new Date(quote.date).toLocaleDateString("it-IT")}</Text>
          <Text style={styles.subtitle}>Preventivo N°: {quote.id}</Text>
          <Text style={styles.subtitle}>Valido fino al: {new Date(quote.validUntil).toLocaleDateString("it-IT")}</Text>
        </View>

        {/* Client Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dati Cliente</Text>
          <Text>Azienda: {quote.clientData.companyName}</Text>
          <Text>Referente: {quote.clientData.contactName}</Text>
          <Text>Email: {quote.clientData.email}</Text>
          <Text>Telefono: {quote.clientData.phone}</Text>
          {quote.clientData.vatNumber && <Text>P.IVA: {quote.clientData.vatNumber}</Text>}
        </View>

        {/* One-time Services */}
        {oneTimeServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servizi Una Tantum</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellHeader}>Servizio</Text>
                </View>
                <View style={styles.tableColPrice}>
                  <Text style={styles.tableCellHeader}>Prezzo</Text>
                </View>
                <View style={styles.tableColPrice}>
                  <Text style={styles.tableCellHeader}>Costo Mensile</Text>
                </View>
              </View>
              {oneTimeServices.map((service) => (
                <View key={service.id} style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text>{service.name}</Text>
                  </View>
                  <View style={styles.tableColPrice}>
                    <Text>{formatCurrency(service.priceOneTime || 0)}</Text>
                  </View>
                  <View style={styles.tableColPrice}>
                    <Text>-</Text>
                  </View>
                </View>
              ))}
              {quote.transportCost > 0 && (
                <View style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text>Costo Trasporto ({quote.distance} km)</Text>
                  </View>
                  <View style={styles.tableColPrice}>
                    <Text>{formatCurrency(quote.transportCost)}</Text>
                  </View>
                  <View style={styles.tableColPrice}>
                    <Text>-</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Monthly Services */}
        {monthlyServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servizi Mensili</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellHeader}>Servizio</Text>
                </View>
                <View style={styles.tableColPrice}>
                  <Text style={styles.tableCellHeader}>Prezzo Una Tantum</Text>
                </View>
                <View style={styles.tableColPrice}>
                  <Text style={styles.tableCellHeader}>Prezzo/mese</Text>
                </View>
              </View>
              {monthlyServices.map((service) => (
                <View key={service.id} style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text>{service.name}</Text>
                  </View>
                  <View style={styles.tableColPrice}>
                    <Text>-</Text>
                  </View>
                  <View style={styles.tableColPrice}>
                    <Text>{formatCurrency(service.priceMonthly || 0)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Totale Una Tantum (escl. IVA)</Text>
            <Text>{formatCurrency(oneTimeTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Totale Mensile (escl. IVA)</Text>
            <Text>{formatCurrency(monthlyTotal)}/mese</Text>
          </View>
          {quote.discountRate > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text>Totale Annuale</Text>
                <Text>{formatCurrency(yearlyTotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Sconto (-{quote.discountRate * 100}%)</Text>
                <Text>-{formatCurrency(discountAmount)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Totale Annuale Scontato</Text>
                <Text>{formatCurrency(discountedYearlyTotal)}</Text>
              </View>
            </>
          )}
          <View style={styles.totalRow}>
            <Text>IVA 22% (Una Tantum)</Text>
            <Text>{formatCurrency(oneTimeVat)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>IVA 22% (Mensile)</Text>
            <Text>{formatCurrency(monthlyVat)}/mese</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTALE Una Tantum (incl. IVA)</Text>
            <Text>{formatCurrency(oneTimeTotalIncVat)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTALE Mensile (incl. IVA)</Text>
            <Text>{formatCurrency(monthlyTotalIncVat)}/mese</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Righello di Matteo Giardino</Text>
          <Text>P.IVA: 12665480019 | Email: info@righello.it | Tel: +39 379 1958 927</Text>
          <Text>Via Principi d'Acaja 38, 10138 Torino (TO)</Text>
        </View>
      </Page>
    </Document>
  )
}

export const generateQuotePDF = (quote: QuoteData) => {
  const fileName = `Preventivo_${quote.clientData.companyName.replace(/\s+/g, "_")}_${new Date(quote.date)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}.pdf`

  return (
    <PDFDownloadLink document={<QuotePDF quote={quote} />} fileName={fileName}>
      {({ loading }) => (loading ? "Generazione PDF..." : "Scarica PDF")}
    </PDFDownloadLink>
  )
}
