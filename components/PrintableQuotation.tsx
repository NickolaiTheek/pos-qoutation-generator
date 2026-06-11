import { renderBold } from "@/components/ItemTable";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Quotation } from "@/types";

const DEFAULT_NOTE =
  "After setup, our team will provide remote support through AnyDesk or similar tools for basic issue checking, guidance and system usage support.";

interface PrintableQuotationProps {
  quotation: Quotation;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWeb?: string;
  businessLogoUrl?: string;
}

const p = (s: React.CSSProperties): React.CSSProperties => s;

// ── Ivory + Ink palette (matches the invoice) ─────────────────
const INK    = "#1c1a17";
const INK2   = "#39342d";
const MUTE   = "#6f685d";
const FAINT  = "#9b9388";
const LINE   = "#e7e1d6";
const LINE2  = "#cfc7b8";
const PAPER  = "#fffdf9";
const IVORY  = "#faf7f0";
const RED    = "#a8442f";

export default function PrintableQuotation({
  quotation,
  businessName = "Zero Pos Solutions",
  businessPhone = "077 787 7345 / 076 332 7419",
  businessEmail = "zeropossolutions@gmail.com",
  businessWeb,
  businessLogoUrl,
}: PrintableQuotationProps) {
  const items = quotation.items ?? [];

  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = item.category || "General";
    if (!grouped[cat]) { grouped[cat] = []; }
    grouped[cat].push(item);
  }
  const CATEGORY_PRIORITY = ["Software", "Hardware", "Service", "Support", "General"];
  const categoryOrder = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_PRIORITY.indexOf(a);
    const bi = CATEGORY_PRIORITY.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const grandTotal = quotation.grandTotal;
  const logo = businessLogoUrl || "/logo.png";

  // Clean up legacy product naming + strip the on-site setup sentence
  function sanitizeName(n?: string | null) {
    if (!n) return n ?? "";
    return n
      .replace(/Life Time Bugs Warranty/gi, "Lifetime Bug-Fix Support")
      .replace(/Day End Email Service/gi, "Daily End Report Email Service")
      .replace(/Technical Support & Product Setup/gi, "Technical Support & System Setup");
  }

  const note = quotation.note?.trim() || DEFAULT_NOTE;

  return (
    <div
      id="printable-quotation"
      style={p({ fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif", fontSize: "11px", color: INK, background: "#e8e6e1" })}
    >
    <div
      className="print-page"
      style={p({
        background: PAPER,
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
        fontSize: "11px",
        color: INK,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      })}
    >

      {/* ── HEADER (Ivory + Ink, hairline rule) ── */}
      <div style={p({ background: PAPER, padding: "16px 18mm 0 18mm", pageBreakInside: "avoid", WebkitPrintColorAdjust: "exact" })}>
        <div style={p({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
          {/* Logo already contains the company name */}
          <img src={logo} alt={businessName} style={p({ height: "70px", width: "auto", objectFit: "contain", display: "block" })} />

          <div style={p({ textAlign: "right" })}>
            <div style={p({ fontSize: "21px", fontWeight: 300, letterSpacing: "5px", color: FAINT, textTransform: "uppercase", marginBottom: "5px" })}>Quotation</div>
            <div style={p({ color: MUTE, fontSize: "9.5px", letterSpacing: "0.2px" })}>
              {businessPhone && <span>{businessPhone}</span>}
              {businessPhone && businessEmail && <span style={p({ margin: "0 7px", color: FAINT })}>•</span>}
              {businessEmail && <span>{businessEmail}</span>}
            </div>
          </div>
        </div>
        <div style={p({ height: "1px", background: INK, marginTop: "14px" })} />
      </div>

      {/* ── QUOTED FOR + META ── */}
      <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 18mm 14px 18mm", gap: "24px" })}>
        <div style={p({ flex: "1 1 0" })}>
          <p style={p({ fontSize: "8px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: FAINT, margin: "0 0 7px 0" })}>Quoted For</p>
          <p style={p({ fontWeight: 800, fontSize: "14px", margin: "0 0 3px 0", color: INK })}>{quotation.customer?.name ?? "—"}</p>
          {quotation.customer?.businessName && <p style={p({ fontSize: "10px", color: INK2, margin: "0 0 1px 0" })}>{quotation.customer.businessName}</p>}
          {quotation.customer?.mobile       && <p style={p({ fontSize: "9.5px", color: MUTE, margin: "0 0 1px 0" })}>T: {quotation.customer.mobile}</p>}
          {quotation.customer?.email        && <p style={p({ fontSize: "9.5px", color: MUTE, margin: "0 0 1px 0" })}>{quotation.customer.email}</p>}
          {quotation.customer?.address      && <p style={p({ fontSize: "9.5px", color: FAINT, margin: 0 })}>{quotation.customer.address}</p>}
        </div>

        <div style={p({ flex: "0 0 200px", boxSizing: "border-box" })}>
          <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0 7px 0", borderBottom: `1px solid ${LINE}` })}>
            <div style={p({ fontSize: "8.5px", fontWeight: 700, color: FAINT, textTransform: "uppercase", letterSpacing: "1.5px" })}>Quotation No.</div>
            <div style={p({ fontSize: "13px", fontWeight: 800, color: INK })}>{quotation.quotationNumber ?? "—"}</div>
          </div>
          <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0 0 0" })}>
            <div style={p({ fontSize: "8.5px", fontWeight: 700, color: FAINT, textTransform: "uppercase", letterSpacing: "1.5px" })}>Date</div>
            <div style={p({ fontSize: "11px", fontWeight: 600, color: INK2 })}>{quotation.date ? formatDate(quotation.date) : "—"}</div>
          </div>
        </div>
      </div>

      {/* ── ITEMS ── */}
      <div style={p({ padding: "0 18mm 0 18mm", flex: 1 })}>
        {categoryOrder.map((cat) => {
          const catItems    = grouped[cat];
          const catSubtotal = catItems.reduce((s, i) => s + (i.quantity ?? 0) * (i.unitPrice ?? 0), 0);
          const catDiscount = catItems.reduce((s, i) => s + (i.discount || 0), 0);
          const catTotal    = catSubtotal - catDiscount;

          return (
            <div key={cat} style={p({ marginBottom: "16px" })}>
              <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "10px" })}>
                <thead>
                  <tr>
                    <th style={p({ padding: "0 9px 6px 0", textAlign: "left",   color: INK,  fontWeight: 800, width: "53%", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: `1.5px solid ${INK}` })}>{cat}</th>
                    <th style={p({ padding: "0 9px 6px 9px", textAlign: "center", color: FAINT, fontWeight: 700, width: "9%",  fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: `1.5px solid ${INK}` })}>Qty</th>
                    <th style={p({ padding: "0 9px 6px 9px", textAlign: "right",  color: FAINT, fontWeight: 700, width: "19%", fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: `1.5px solid ${INK}` })}>Unit Price</th>
                    <th style={p({ padding: "0 0 6px 9px", textAlign: "right",   color: FAINT, fontWeight: 700, width: "19%", fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: `1.5px solid ${INK}` })}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {catItems.map((item) => (
                    <tr key={item.id} style={p({ borderBottom: `1px solid ${LINE}` })}>
                      <td style={p({ padding: "9px 9px 9px 0", verticalAlign: "top" })}>
                        <span style={p({ fontWeight: 700, color: INK, display: "block", fontSize: "10.5px" })}>{sanitizeName(item.name)}</span>
                        {item.description && <span style={p({ fontSize: "9.5px", color: MUTE, display: "block", marginTop: "2px", lineHeight: 1.5 })}>{renderBold(item.description)}</span>}
                        {item.warranty    && <span style={p({ fontStyle: "italic", fontSize: "9px", color: FAINT, display: "block", marginTop: "2px" })}>{item.warranty}</span>}
                      </td>
                      <td style={p({ padding: "9px 9px", textAlign: "center", verticalAlign: "top", color: INK2, fontWeight: 600 })}>{item.quantity ? item.quantity : <span style={p({ color: FAINT })}>—</span>}</td>
                      <td style={p({ padding: "9px 9px", textAlign: "right", verticalAlign: "top", color: MUTE, whiteSpace: "nowrap" })}>
                        {(item.unitPrice ?? 0) === 0 ? <span style={p({ fontWeight: 700, color: INK, letterSpacing: "0.5px" })}>Free</span> : formatCurrency(item.unitPrice)}
                      </td>
                      <td style={p({ padding: "9px 0 9px 9px", textAlign: "right", verticalAlign: "top", fontWeight: 700, color: INK, whiteSpace: "nowrap" })}>
                        {(item.total ?? 0) === 0 ? <span style={p({ fontWeight: 700, color: INK, letterSpacing: "0.5px" })}>Free</span> : formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Category totals */}
              <div style={p({ display: "flex", justifyContent: "flex-end", marginTop: "2px" })}>
                <table style={p({ borderCollapse: "collapse", fontSize: "9.5px", minWidth: "230px" })}>
                  <tbody>
                    {catDiscount > 0 && (
                      <>
                        <tr>
                          <td style={p({ padding: "3px 14px 3px 8px", color: MUTE })}>Sub Total</td>
                          <td style={p({ padding: "3px 0 3px 0", textAlign: "right", minWidth: "100px", color: INK2 })}>{formatCurrency(catSubtotal)}</td>
                        </tr>
                        <tr>
                          <td style={p({ padding: "3px 14px 3px 8px", color: MUTE })}>Discount</td>
                          <td style={p({ padding: "3px 0 3px 0", textAlign: "right", color: RED })}>−{formatCurrency(catDiscount)}</td>
                        </tr>
                      </>
                    )}
                    <tr style={p({ borderTop: `1px solid ${LINE2}` })}>
                      <td style={p({ padding: "5px 14px 0 8px", fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: "1px", fontSize: "9px" })}>{cat} Total</td>
                      <td style={p({ padding: "5px 0 0 0", fontWeight: 800, color: INK, textAlign: "right", fontSize: "11px" })}>{formatCurrency(catTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* ── GRAND TOTAL — outlined ── */}
        <div style={p({ display: "flex", justifyContent: "flex-end", margin: "6px 0 18px 0" })}>
          <div style={p({ border: `1.5px solid ${INK}`, borderRadius: "4px", padding: "11px 18px", display: "flex", alignItems: "center", gap: "36px", minWidth: "270px", background: IVORY })}>
            <span style={p({ color: MUTE, fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" })}>Grand Total</span>
            <span style={p({ color: INK, fontSize: "17px", fontWeight: 800, marginLeft: "auto" })}>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* ── NOTE ── */}
        {note && (
          <div style={p({ background: IVORY, borderLeft: `2px solid ${LINE2}`, padding: "10px 14px", marginBottom: "14px", borderRadius: "0 4px 4px 0" })}>
            <p style={p({ fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase", color: FAINT, margin: "0 0 5px 0", letterSpacing: "1.5px" })}>Note</p>
            <p style={p({ fontSize: "10px", lineHeight: 1.6, color: INK2, margin: 0 })}>{note}</p>
          </div>
        )}

      </div>

      {/* ── FOOTER ── */}
      <div style={p({ padding: "10px 18mm 12px 18mm", borderTop: `1px solid ${INK}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", pageBreakInside: "avoid" })}>
        <span style={p({ color: FAINT, fontSize: "9px", letterSpacing: "0.5px" })}>{businessName}</span>
        <span style={p({ color: MUTE, fontSize: "9px" })}>
          {businessPhone && <>{businessPhone}</>}
          {businessPhone && businessEmail && <span style={p({ margin: "0 8px", color: FAINT })}>•</span>}
          {businessEmail && <>{businessEmail}</>}
          {businessWeb && <><span style={p({ margin: "0 8px", color: FAINT })}>•</span>{businessWeb}</>}
        </span>
      </div>

    </div>
    </div>
  );
}
