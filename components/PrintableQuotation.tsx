import { formatCurrency, formatDate } from "@/lib/utils";
import type { Quotation } from "@/types";

const DEFAULT_NOTE =
  "We will visit your location and complete the full POS system setup. If any issue occurs after setup, our team can guide and support you remotely through AnyDesk, so there is no need to worry.";

interface PrintableQuotationProps {
  quotation: Quotation;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWeb?: string;
}

const S: Record<string, React.CSSProperties> = {
  page: {
    background: "#fff",
    width: "210mm",
    minHeight: "297mm",
    margin: "0 auto",
    padding: "14mm 14mm 10mm 14mm",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "11px",
    color: "#111",
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "6px",
  },
  logoBox: {
    width: "44px",
    height: "44px",
    background: "#1a1a1a",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: { color: "#fff", fontWeight: 900, fontSize: "15px" },
  companyName: { fontWeight: 700, fontSize: "16px", margin: 0, lineHeight: 1.2 },
  companyMeta: { fontSize: "10px", color: "#555", marginTop: "2px", lineHeight: 1.6 },
  docTitle: {
    textAlign: "right" as const,
  },
  docTitleText: {
    fontWeight: 900,
    fontSize: "22px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: 0,
    lineHeight: 1,
  },
  docNumber: { fontSize: "11px", color: "#444", marginTop: "4px" },
  docDate: { fontSize: "10px", color: "#444", marginTop: "2px" },
  divider: { borderTop: "2px solid #111", margin: "8px 0" },
  thinDivider: { borderTop: "1px solid #ccc", margin: "6px 0" },
  toSection: { marginBottom: "10px" },
  toLabel: {
    fontWeight: 700,
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "3px",
    color: "#111",
  },
  toName: { fontWeight: 700, fontSize: "13px", margin: "0 0 2px 0" },
  toMeta: { fontSize: "10px", color: "#444", lineHeight: 1.6 },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "12px",
    fontSize: "11px",
  },
  thead: { background: "#333", color: "#fff" },
  th: {
    padding: "7px 8px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    fontSize: "10px",
    letterSpacing: "0.3px",
    textAlign: "left" as const,
    borderBottom: "1px solid #222",
    color: "#fff",
  },
  thRight: {
    padding: "7px 8px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    fontSize: "10px",
    letterSpacing: "0.3px",
    textAlign: "right" as const,
    borderBottom: "1px solid #222",
    color: "#fff",
  },
  thCenter: {
    padding: "7px 8px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    fontSize: "10px",
    letterSpacing: "0.3px",
    textAlign: "center" as const,
    borderBottom: "1px solid #222",
    color: "#fff",
  },
  tdItem: {
    padding: "7px 8px",
    verticalAlign: "top" as const,
    borderBottom: "1px solid #e5e5e5",
  },
  tdCenter: {
    padding: "7px 8px",
    textAlign: "center" as const,
    verticalAlign: "top" as const,
    borderBottom: "1px solid #e5e5e5",
  },
  tdRight: {
    padding: "7px 8px",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
    borderBottom: "1px solid #e5e5e5",
    whiteSpace: "nowrap" as const,
  },
  itemName: { fontWeight: 700, margin: 0 },
  itemDesc: { fontSize: "10px", color: "#555", marginTop: "2px" },
  itemWarranty: { fontSize: "10px", color: "#333", fontStyle: "italic" as const, marginTop: "1px" },
  totalsTable: {
    width: "240px",
    marginLeft: "auto",
    borderCollapse: "collapse" as const,
    fontSize: "11px",
    marginBottom: "14px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    borderBottom: "1px solid #e5e5e5",
    fontSize: "11px",
  },
  totalRowGrand: {
    display: "flex",
    justifyContent: "space-between",
    padding: "7px 8px",
    background: "#1a1a1a",
    color: "#fff",
    fontWeight: 900,
    fontSize: "13px",
    marginTop: "4px",
  },
  noteBox: {
    border: "1px solid #ccc",
    padding: "8px 10px",
    marginBottom: "14px",
    background: "#fafafa",
  },
  noteLabel: { fontWeight: 700, fontSize: "10px", textTransform: "uppercase" as const, marginBottom: "4px" },
  noteText: { fontSize: "10px", lineHeight: 1.7, color: "#333" },
  footer: { borderTop: "1px solid #aaa", paddingTop: "6px", textAlign: "center" as const, fontSize: "10px", color: "#555" },
};

export default function PrintableQuotation({
  quotation,
  businessName = "Zero Pos",
  businessAddress,
  businessPhone,
  businessEmail,
  businessWeb,
}: PrintableQuotationProps) {
  const subtotal = quotation.subtotal;
  const discountTotal = quotation.discountTotal;
  const grandTotal = quotation.grandTotal;

  return (
    <div id="printable-quotation" style={S.page}>

      {/* ── Header ── */}
      <div style={S.headerRow}>
        {/* Left: logo + company */}
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div style={S.logoBox}>
            <span style={S.logoText}>ZP</span>
          </div>
          <div>
            <p style={S.companyName}>{businessName}</p>
            <p style={S.companyMeta}>
              POS System Solutions
              {businessPhone && <><br />T: {businessPhone}</>}
              {businessEmail && <><br />E: {businessEmail}</>}
              {businessWeb && <><br />W: {businessWeb}</>}
            </p>
          </div>
        </div>

        {/* Right: doc type + number + date */}
        <div style={S.docTitle}>
          <p style={S.docTitleText}>Price Quotation</p>
          <p style={S.docNumber}>#{quotation.quotationNumber}</p>
          <p style={S.docDate}><strong>DATE:</strong> {formatDate(quotation.date)}</p>
          <p style={{ ...S.docDate, marginTop: "1px" }}><strong>Status:</strong> {quotation.status}</p>
        </div>
      </div>

      <div style={S.divider} />

      {/* ── Customer ── */}
      <div style={S.toSection}>
        <p style={S.toLabel}>Quotation To:</p>
        <p style={S.toName}>{quotation.customer?.name}</p>
        <p style={S.toMeta}>
          {quotation.customer?.businessName && <>{quotation.customer.businessName}<br /></>}
          {quotation.customer?.mobile && <>T: {quotation.customer.mobile}<br /></>}
          {quotation.customer?.email && <>{quotation.customer.email}<br /></>}
          {quotation.customer?.address && <>{quotation.customer.address}</>}
        </p>
      </div>

      <div style={S.thinDivider} />

      {/* ── Items Table ── */}
      <table style={S.table}>
        <thead style={S.thead}>
          <tr>
            <th style={S.th}>#</th>
            <th style={S.th}>Item / Description</th>
            <th style={S.thCenter}>Qty</th>
            <th style={S.thRight}>Unit Price</th>
            {discountTotal > 0 && <th style={S.thRight}>Discount</th>}
            <th style={S.thRight}>Total</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items?.map((item, i) => (
            <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f7f7f7" }}>
              <td style={{ ...S.tdItem, color: "#777", width: "24px" }}>{i + 1}</td>
              <td style={S.tdItem}>
                <p style={S.itemName}>{item.name}</p>
                {item.description && <p style={S.itemDesc}>{item.description}</p>}
                {item.warranty && <p style={S.itemWarranty}>Warranty: {item.warranty}</p>}
              </td>
              <td style={S.tdCenter}>{item.quantity}</td>
              <td style={S.tdRight}>{formatCurrency(item.unitPrice)}</td>
              {discountTotal > 0 && (
                <td style={S.tdRight}>{item.discount > 0 ? `- ${formatCurrency(item.discount)}` : "—"}</td>
              )}
              <td style={{ ...S.tdRight, fontWeight: 700 }}>{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ width: "240px", marginLeft: "auto" }}>
          <div style={S.totalRow}>
            <span>Sub Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div style={{ ...S.totalRow, color: "#555" }}>
              <span>Discount</span>
              <span>- {formatCurrency(discountTotal)}</span>
            </div>
          )}
          <div style={S.totalRowGrand}>
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* ── Note ── */}
      {(quotation.note || DEFAULT_NOTE) && (
        <div style={S.noteBox}>
          <p style={S.noteLabel}>Note:</p>
          <p style={S.noteText}>{quotation.note || DEFAULT_NOTE}</p>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={S.footer}>
        {[businessPhone && `T: ${businessPhone}`, businessEmail && `E: ${businessEmail}`, businessWeb && `W: ${businessWeb}`]
          .filter(Boolean).join("   |   ")}
        {!businessPhone && !businessEmail && !businessWeb && `${businessName} — Thank you for choosing us!`}
      </div>

    </div>
  );
}
