"use client";

import {
  Document,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { maskCurrencyBRL } from "@/lib/masks";
import {
  aggregateByPallet,
  slugify,
  type PayrollSummary,
} from "@/lib/payroll";
import type { ProductionHistory } from "@/services/production-history.service";

const PALLET_PATHS = [
  "M0.5 22.1364V25.0071L158.173 66.537M0.5 22.1364L158.173 63.8576M0.5 22.1364L18.8952 17.5432L178.028 56.5851M158.173 66.537V63.8576M158.173 66.537L178.028 59.0731V56.5851M158.173 63.8576L178.028 56.5851",
  "M183.868 53.906L24.443 16.3951M183.868 53.906V56.3939M183.868 53.906L194.964 49.3128M24.443 16.3951V18.8831L183.868 56.3939M24.443 16.3951L36.7065 13.5244L194.964 49.3128M183.868 56.3939L194.964 51.6094V49.3128",
  "M219.199 38.5956L64.4452 7.40032M219.199 38.5956V40.8921M219.199 38.5956L228.542 34.5765M64.4452 7.40032V9.31414L219.199 40.8921M64.4452 7.40032L74.3728 4.91235L228.542 34.5765M219.199 40.8921L228.542 36.6817V34.5765",
  "M200.22 49.3127V47.0161M200.22 49.3127L42.8383 14.6726V12.376M200.22 49.3127L214.819 42.8057V40.7005M200.22 47.0161L42.8383 12.376M200.22 47.0161L214.819 40.7005M42.8383 12.376L58.6056 8.54834L214.819 40.7005",
  "M79.3365 3.76399L232.922 32.6626M79.3365 3.76399L93.3519 0.510498L244.309 27.8781M79.3365 3.76399V5.86919L232.922 35.342M232.922 32.6626L244.309 27.8781M232.922 32.6626V35.342M244.309 27.8781V30.3661L232.922 35.342",
  "M135.982 60.7959V63.858L158.173 69.7909M158.173 69.7909L244.31 32.8542V30.3662M158.173 69.7909V66.5374M178.028 58.308L182.992 56.2028M195.089 51.0354L199.646 49.1216M214.819 42.7502L219.199 40.8922M232.046 35.1508L228.542 36.4904M197.423 36.4178L196.132 36.9302M177.549 44.3032L175.809 44.9937M160.714 50.983L158.465 51.8752",
  "M158.072 79.3596L135.982 72.8526V63.8577L158.072 69.7905M158.072 79.3596V69.7905M158.072 79.3596L169.853 74.0009V64.8146L158.072 69.7905",
  "M158.173 79.3597V82.039M158.173 79.3597L1.08398 34.0022V35.916L158.173 82.039M158.173 79.3597L169.853 74.001V76.6803L158.173 82.039M135.982 65.1974C133.282 64.8287 110.655 58.5212 86.3443 51.6093M24.735 33.8108C29.4394 35.2356 42.7464 39.1131 58.6055 43.6782",
  "M1.08398 25.1987V34.0023L13.3475 37.4472M13.3475 37.4472V28.4522M13.3475 37.4472L24.735 33.8109V31.3229",
  "M58.8975 40.3179C58.8975 40.6241 58.8975 47.3352 58.8975 50.6525M74.9568 44.7197L74.6648 55.0543L86.3443 51.6094C86.3443 50.5249 86.3443 48.2028 86.3443 47.5904",
  "M199.051 52.375V59.8389M199.051 59.8389L212.775 53.7146M199.051 59.8389L186.496 57.7337M199.051 59.8389V62.7096M212.775 53.7146V46.4421M212.775 53.7146V56.7768L199.051 62.7096M199.051 62.7096L182.992 59.2647",
  "M235.258 36.7875V42.7812M235.258 42.7812L243.142 39.9352M235.258 42.7812L225.038 41.0835M235.258 42.7812V45.1025M243.142 39.9352V33.4282M243.142 39.9352V42.2318L235.258 45.1025M235.258 45.1025L221.535 42.6146",
  "M141.822 25.1305C141.433 25.2554 141.044 25.3806 140.654 25.5061M123 21.2842C122.694 21.3768 122.388 21.4695 122.082 21.5624M101.82 27.6866C101.464 27.7946 101.129 27.9184 100.783 28.0287M119.631 32.3144C120.113 32.1567 120.6 31.9978 121.091 31.8377M83.287 33.3518C83.6084 33.2532 83.9465 33.1536 84.3004 33.0453H84.5924M102.404 38.0502C102.86 37.8922 103.347 37.7246 103.864 37.5481",
];

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#2C1F16",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "2px solid #B8860B",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brandWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { flexDirection: "column" },
  brandTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#B8860B",
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 8,
    color: "#8B7355",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 2,
  },
  headerRight: { textAlign: "right" },
  title: { fontSize: 16, fontWeight: 700, color: "#2C1F16" },
  subtitle: { fontSize: 10, color: "#8B7355", marginTop: 2 },

  section: { marginBottom: 14 },
  sectionLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#8B7355",
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionValue: { fontSize: 11, fontWeight: 700 },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2C1F16",
    color: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #E8D9BE",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "#FFF5EB",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTop: "2px solid #B8860B",
    fontWeight: 700,
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1.3, textAlign: "right" },
  col4: { flex: 1.5, textAlign: "right" },

  signatures: {
    marginTop: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 32,
  },
  signatureBox: { flex: 1, alignItems: "center" },
  signatureLine: {
    borderTop: "1px solid #2C1F16",
    width: "100%",
    marginTop: 40,
  },
  signatureLabel: { fontSize: 9, marginTop: 4, textAlign: "center" },
  signatureName: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 2,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#8B7355",
    textAlign: "center",
  },
});

interface PayrollPDFProps {
  userName: string;
  periodLabel: string;
  summary: PayrollSummary;
  issuedAt: Date;
}

export function PayrollPDF({
  userName,
  periodLabel,
  summary,
  issuedAt,
}: PayrollPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandWrap}>
            <Svg width={64} height={22} viewBox="0 0 245 83">
              {PALLET_PATHS.map((d, i) => (
                <Path key={i} d={d} stroke="#B8860B" strokeWidth={1} />
              ))}
            </Svg>
            <View style={styles.brand}>
              <Text style={styles.brandTitle}>PALETES</Text>
              <Text style={styles.brandSubtitle}>Maracajá</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>Folha de Pagamento</Text>
            <Text style={styles.subtitle}>
              Emitido em {format(issuedAt, "dd/MM/yyyy")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Colaborador</Text>
          <Text style={styles.sectionValue}>{userName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Período</Text>
          <Text style={styles.sectionValue}>{periodLabel}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Palete</Text>
          <Text style={styles.col2}>Qtd</Text>
          <Text style={styles.col3}>Unitário (R$)</Text>
          <Text style={styles.col4}>Subtotal (R$)</Text>
        </View>
        {summary.rows.map((row) => (
          <View key={row.palletId} style={styles.tableRow}>
            <Text style={styles.col1}>
              {row.name} v{row.version}
            </Text>
            <Text style={styles.col2}>{row.qty}</Text>
            <Text style={styles.col3}>{maskCurrencyBRL(row.unit)}</Text>
            <Text style={styles.col4}>{maskCurrencyBRL(row.subtotal)}</Text>
          </View>
        ))}
        <View style={styles.tableFooter}>
          <Text style={styles.col1}>Total</Text>
          <Text style={styles.col2}>
            {summary.rows.reduce((a, r) => a + r.qty, 0)}
          </Text>
          <Text style={styles.col3}></Text>
          <Text style={styles.col4}>{maskCurrencyBRL(summary.total)}</Text>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{userName}</Text>
            <Text style={styles.signatureLabel}>Assinatura do colaborador</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              Assinatura do responsável
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Emitido em{" "}
          {format(issuedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </Text>
      </Page>
    </Document>
  );
}

export async function downloadPayrollPdf(args: {
  userName: string;
  entries: ProductionHistory[];
  from: Date;
  to: Date;
}) {
  const summary = aggregateByPallet(args.entries);
  const periodLabel = `${format(args.from, "dd/MM/yyyy")} a ${format(
    args.to,
    "dd/MM/yyyy",
  )}`;

  const blob = await pdf(
    <PayrollPDF
      userName={args.userName}
      periodLabel={periodLabel}
      summary={summary}
      issuedAt={new Date()}
    />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `folha-${slugify(args.userName)}-${format(
    new Date(),
    "yyyy-MM-dd",
  )}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
