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

const p = (s: React.CSSProperties): React.CSSProperties => s;

export default function PrintableQuotation({
  quotation,
  businessName = "Zero Pos",
  businessPhone,
  businessEmail,
  businessWeb,
}: PrintableQuotationProps) {
  const items = quotation.items ?? [];

  const categoryOrder: string[] = [];
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = item.category || "General";
    if (!grouped[cat]) { grouped[cat] = []; categoryOrder.push(cat); }
    grouped[cat].push(item);
  }

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

      {/* DATE / QUOTE# top right */}
      <div style={p({ textAlign: "right", marginBottom: "6px", lineHeight: 1.7, fontSize: "11px" })}>
        <span style={p({ fontWeight: 700 })}>DATE:&nbsp;&nbsp;</span>{formatDate(quotation.date)}
        <br />
        <span style={p({ fontWeight: 700 })}>Quote No:&nbsp;&nbsp;</span>#{quotation.quotationNumber}
      </div>

      {/* 3-COLUMN HEADER */}
      <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "flex-start" })}>

        {/* LEFT: logo + company */}
        <div style={p({ flex: "0 0 38%" })}>
          <div style={p({
            width: "64px", height: "64px", background: "#1a1a1a", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px",
          })}>
            <span style={p({ color: "#fff", fontWeight: 900, fontSize: "20px", letterSpacing: "-1px" })}>ZP</span>
          </div>
          <p style={p({ fontWeight: 700, fontSize: "13px", margin: "0 0 3px 0" })}>{businessName}</p>
          {businessPhone && (
            <p style={p({ fontSize: "10px", color: "#333", margin: "0 0 2px 0" })}>T: {businessPhone}</p>
          )}
          {(businessEmail || businessWeb) && (
            <p style={p({ fontSize: "10px", color: "#333", margin: 0 })}>
              {businessEmail && `E: ${businessEmail}`}
              {businessEmail && businessWeb && " | "}
              {businessWeb && `W: ${businessWeb}`}
            </p>
          )}
        </div>

        {/* CENTER: title */}
        <div style={p({ flex: "0 0 30%", textAlign: "center", paddingTop: "6px" })}>
          <h1 style={p({ fontWeight: 700, fontSize: "26px", margin: 0, letterSpacing: "0.5px" })}>
            Quotation
          </h1>
        </div>

        {/* RIGHT: TO: customer */}
        <div style={p({ flex: "0 0 30%", textAlign: "right", paddingTop: "6px" })}>
          <p style={p({ fontWeight: 700, fontSize: "11px", margin: "0 0 4px 0" })}>TO:</p>
          <p style={p({ fontWeight: 700, fontSize: "12px", margin: "0 0 2px 0" })}>{quotation.customer?.name}</p>
          {quotation.customer?.businessName && (
            <p style={p({ fontSize: "10px", color: "#333", margin: "0 0 1px 0" })}>{quotation.customer.businessName}</p>
          )}
          {quotation.customer?.mobile && (
            <p style={p({ fontSize: "10px", color: "#333", margin: "0 0 1px 0" })}>T: {quotation.customer.mobile}</p>
          )}
          {quotation.customer?.email && (
            <p style={p({ fontSize: "10px", color: "#333", margin: "0 0 1px 0" })}>{quotation.customer.email}</p>
          )}
          {quotation.customer?.address && (
            <p style={p({ fontSize: "10px", color: "#555", margin: 0 })}>{quotation.customer.address}</p>
          )}
        </div>

      </div>

      {/* DIVIDER */}
      <div style={p({ borderTop: "1.5px solid #111", margin: "10px 0" })} />

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
                        <span style={p({ fontWeight: 400, fontSize: "10.5px", color: "#333" })}> ({item.description})</span>
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
                  <tr>
                    <td style={p({ padding: "3px 16px 3px 8px", color: "#333" })}>Sub Total</td>
                    <td style={p({ padding: "3px 0 3px 8px", textAlign: "right", minWidth: "90px" })}>{formatCurrency(catSubtotal)}</td>
                  </tr>
                  {catDiscount > 0 && (
                    <tr>
                      <td style={p({ padding: "3px 16px 3px 8px", color: "#333" })}>Discount</td>
                      <td style={p({ padding: "3px 0 3px 8px", textAlign: "right", color: "#333" })}>-{formatCurrency(catDiscount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={p({ padding: "3px 16px 3px 8px", fontWeight: 700, borderTop: "1px solid #ccc" })}>{cat} Total</td>
                    <td style={p({ padding: "3px 0 3px 8px", textAlign: "right", fontWeight: 700, borderTop: "1px solid #ccc" })}>{formatCurrency(catTotal)}</td>
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
