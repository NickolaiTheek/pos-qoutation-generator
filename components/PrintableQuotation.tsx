import { renderBold } from "@/components/ItemTable";
import { formatCurrency } from "@/lib/utils";
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

const p = (s: React.CSSProperties): React.CSSProperties => s;

export default function PrintableQuotation({
  quotation,
  businessName = "Zero Pos",
  businessPhone,
  businessEmail,
  businessWeb,
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

  return (
    <div
      id="printable-quotation"
      style={p({
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "12mm 14mm 10mm 14mm",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        color: "#111",
        boxSizing: "border-box",
      })}
    >

      {/* Black & white header (logo + company) with no meta card */}
      <div style={p({ background: "#0a0a0a", padding: "12px 14mm", marginBottom: "8px" })}>
        <div style={p({ display: "flex", alignItems: "center", gap: "12px" })}>
          <div style={p({ width: "72px", height: "72px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" })}>
            <img src="/logo-bw.png" alt={businessName} style={p({ width: "60px", height: "60px", objectFit: "contain" })} />
          </div>
          <div>
            <div style={p({ color: "#fff", fontWeight: 800, fontSize: "16px" })}>{businessName}</div>
            <div style={p({ color: "#fff", fontSize: "11px", marginTop: "4px" })}>
              {businessPhone && <span>T: {businessPhone}</span>}
              {businessPhone && businessEmail && <span style={p({ margin: "0 6px" })}>•</span>}
              {businessEmail && <span>E: {businessEmail}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY SECTIONS */}
      {categoryOrder.map((cat) => {
        const catItems = grouped[cat];
        const catSubtotal = catItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
        const catDiscount = catItems.reduce((s, i) => s + (i.discount || 0), 0);
        const catTotal = catSubtotal - catDiscount;

        return (
          <div key={cat} style={p({ marginBottom: "8px" })}>
            <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "4px" })}>
              <thead>
                <tr style={p({ background: "#d8d8d8" })}>
                  <th style={p({ padding: "7px 8px", textAlign: "left", fontWeight: 700, fontSize: "11px", width: "60%", borderBottom: "1px solid #bbb" })}>{cat}</th>
                  <th style={p({ padding: "7px 8px", textAlign: "right", fontWeight: 700, fontSize: "11px", width: "8%", borderBottom: "1px solid #bbb" })}>Qty</th>
                  <th style={p({ padding: "7px 8px", textAlign: "right", fontWeight: 700, fontSize: "11px", width: "16%", borderBottom: "1px solid #bbb" })}>Price</th>
                  <th style={p({ padding: "7px 8px", textAlign: "right", fontWeight: 700, fontSize: "11px", width: "16%", borderBottom: "1px solid #bbb" })}>Total</th>
                </tr>
              </thead>
              <tbody>
                {catItems.map((item) => (
                  <tr key={item.id} style={p({ borderBottom: "1px solid #e8e8e8" })}>
                    <td style={p({ padding: "7px 8px", verticalAlign: "top" })}>
                      <span style={p({ fontWeight: 700 })}>{item.name}</span>
                      {item.description && (
                        <><br /><span style={p({ fontWeight: 400, fontSize: "10.5px", color: "#555" })}>{renderBold(item.description)}</span></>
                      )}
                      {item.warranty && (
                        <><br /><span style={p({ fontStyle: "italic", fontSize: "10px", color: "#444" })}>{item.warranty}</span></>
                      )}
                    </td>
                    <td style={p({ padding: "7px 8px", textAlign: "right", verticalAlign: "top" })}>{item.quantity}</td>
                    <td style={p({ padding: "7px 8px", textAlign: "right", verticalAlign: "top", whiteSpace: "nowrap" })}>
                      {item.unitPrice === 0 ? "Free" : formatCurrency(item.unitPrice)}
                    </td>
                    <td style={p({ padding: "7px 8px", textAlign: "right", verticalAlign: "top", whiteSpace: "nowrap" })}>
                      {item.total === 0 ? "Free" : formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Category totals */}
            <div style={p({ display: "flex", justifyContent: "flex-end", paddingBottom: "10px", borderBottom: "1px solid #ccc", marginBottom: "14px" })}>
              <table style={p({ borderCollapse: "collapse", fontSize: "11px", minWidth: "230px" })}>
                <tbody>
                  {catDiscount > 0 && (
                    <>
                      <tr>
                        <td style={p({ padding: "3px 16px 3px 8px", color: "#333" })}>Sub Total</td>
                        <td style={p({ padding: "3px 0 3px 8px", textAlign: "right", minWidth: "90px" })}>{formatCurrency(catSubtotal)}</td>
                      </tr>
                      <tr>
                        <td style={p({ padding: "3px 16px 3px 8px", color: "#333" })}>Discount</td>
                        <td style={p({ padding: "3px 0 3px 8px", textAlign: "right", color: "#333" })}>-{formatCurrency(catDiscount)}</td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td style={p({ padding: "3px 16px 3px 8px", fontWeight: 700, borderTop: catDiscount > 0 ? "1px solid #ccc" : "none" })}>{cat} Total</td>
                    <td style={p({ padding: "3px 0 3px 8px", textAlign: "right", fontWeight: 700, borderTop: catDiscount > 0 ? "1px solid #ccc" : "none", minWidth: "90px" })}>{formatCurrency(catTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* GRAND TOTAL */}
      <div style={p({ display: "flex", justifyContent: "flex-end", marginBottom: "14px" })}>
        <table style={p({ borderCollapse: "collapse", fontSize: "12px", minWidth: "230px" })}>
          <tbody>
            <tr>
              <td style={p({ padding: "6px 16px 6px 8px", fontWeight: 900, fontSize: "13px", borderTop: "2px solid #111" })}>Grand Total</td>
              <td style={p({ padding: "6px 0 6px 8px", textAlign: "right", fontWeight: 900, fontSize: "13px", borderTop: "2px solid #111", minWidth: "90px" })}>{formatCurrency(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* NOTE */}
      {(quotation.note || DEFAULT_NOTE) && (
        <div style={p({ border: "1px solid #ccc", padding: "8px 10px", marginBottom: "16px", background: "#fafafa" })}>
          <p style={p({ fontWeight: 700, fontSize: "10px", textTransform: "uppercase", marginBottom: "4px" })}>Note:</p>
          <p style={p({ fontSize: "10px", lineHeight: 1.7, color: "#333", margin: 0 })}>{quotation.note || DEFAULT_NOTE}</p>
        </div>
      )}

      {/* FOOTER */}
      <div style={p({ borderTop: "1px solid #999", paddingTop: "6px", textAlign: "center", fontSize: "10px", color: "#444" })}>
        {businessPhone && <span>Mobile: <strong>{businessPhone}</strong></span>}
        {businessPhone && businessEmail && <span>&nbsp;&nbsp;&nbsp;E-Mail: <strong>{businessEmail}</strong></span>}
        {!businessPhone && businessEmail && <span>E-Mail: <strong>{businessEmail}</strong></span>}
        {businessWeb && <span>&nbsp;&nbsp;&nbsp;Web: <strong>{businessWeb}</strong></span>}
        {!businessPhone && !businessEmail && !businessWeb && <span>{businessName} — Thank you for choosing us!</span>}
      </div>

    </div>
  );
}
