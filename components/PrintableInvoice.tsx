import { renderBold } from "@/components/ItemTable";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";

const DEFAULT_NOTE =
  "We will visit your location and complete the full POS system setup. If any issue occurs after setup, our team can guide and support you remotely through AnyDesk, so there is no need to worry.";

interface PrintableInvoiceProps {
  invoice: Invoice;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWeb?: string;
}

const p = (s: React.CSSProperties): React.CSSProperties => s;

// Brand palette
const NAVY = "#1a2744";
const NAVY_LIGHT = "#243057";
const ACCENT = "#2563eb";
const PAID_GREEN = "#16a34a";
const UNPAID_ORANGE = "#d97706";
const CANCEL_RED = "#dc2626";

function statusBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "10px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };
  if (status === "Paid") return { ...base, background: "#dcfce7", color: PAID_GREEN, border: "1px solid #86efac" };
  if (status === "Cancelled") return { ...base, background: "#fee2e2", color: CANCEL_RED, border: "1px solid #fca5a5" };
  return { ...base, background: "#fef3c7", color: UNPAID_ORANGE, border: "1px solid #fcd34d" };
}

export default function PrintableInvoice({
  invoice,
  businessName = "Zero Pos",
  businessPhone,
  businessEmail,
  businessWeb,
}: PrintableInvoiceProps) {
  const items = invoice.items ?? [];

  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = item.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }
  const CATEGORY_PRIORITY = ["Software", "Hardware", "Service", "Support", "General"];
  const categoryOrder = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_PRIORITY.indexOf(a);
    const bi = CATEGORY_PRIORITY.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const grandTotal = invoice.grandTotal;
  const isPaid = invoice.status === "Paid";

  return (
    <div
      id="printable-invoice"
      style={p({
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
        fontSize: "11px",
        color: "#111",
        boxSizing: "border-box",
        position: "relative",
      })}
    >
      {/* ── PAID WATERMARK ────────────────────────────────── */}
      {isPaid && (
        <div style={p({
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          fontSize: "90px",
          fontWeight: 900,
          color: PAID_GREEN,
          opacity: 0.07,
          letterSpacing: "6px",
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
          zIndex: 0,
        })}>PAID</div>
      )}

      {/* ── NAVY HEADER BANNER ────────────────────────────── */}
      <div style={p({
        background: NAVY,
        padding: "18px 20mm 16px 20mm",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      })}>
        {/* Left: Logo + Company */}
        <div>
          <img
            src="/logo-bw.png"
            alt={businessName}
            style={p({ width: "90px", marginBottom: "8px", display: "block", filter: "brightness(0) invert(1)" })}
          />
          <p style={p({ color: "#e2e8f0", fontSize: "11px", margin: "0 0 2px 0", fontWeight: 700 })}>{businessName}</p>
          {businessPhone && (
            <p style={p({ color: "#94a3b8", fontSize: "10px", margin: "0 0 1px 0" })}>T: {businessPhone}</p>
          )}
          {(businessEmail || businessWeb) && (
            <p style={p({ color: "#94a3b8", fontSize: "10px", margin: 0 })}>
              {businessEmail && `E: ${businessEmail}`}
              {businessEmail && businessWeb && "  |  "}
              {businessWeb && `W: ${businessWeb}`}
            </p>
          )}
        </div>

        {/* Right: INVOICE title */}
        <div style={p({ textAlign: "right" })}>
          <h1 style={p({
            color: "#fff",
            fontSize: "42px",
            fontWeight: 900,
            margin: "0 0 4px 0",
            letterSpacing: "3px",
            textTransform: "uppercase",
            lineHeight: 1,
          })}>INVOICE</h1>
          <p style={p({ color: "#94a3b8", fontSize: "11px", margin: 0, letterSpacing: "0.5px" })}>{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* ── ACCENT STRIPE ─────────────────────────────────── */}
      <div style={p({ background: ACCENT, height: "4px" })} />

      {/* ── BILL-TO + INVOICE META ────────────────────────── */}
      <div style={p({
        display: "flex",
        justifyContent: "space-between",
        padding: "16px 20mm 12px 20mm",
        gap: "20px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
      })}>
        {/* Bill To */}
        <div style={p({ flex: "0 0 50%" })}>
          <p style={p({
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: ACCENT,
            margin: "0 0 6px 0",
            borderBottom: "2px solid " + ACCENT,
            paddingBottom: "3px",
            display: "inline-block",
          })}>Bill To</p>
          <p style={p({ fontWeight: 700, fontSize: "13px", margin: "0 0 3px 0", color: "#0f172a" })}>
            {invoice.customer?.name ?? "—"}
          </p>
          {invoice.customer?.businessName && (
            <p style={p({ fontSize: "10.5px", color: "#475569", margin: "0 0 2px 0" })}>{invoice.customer.businessName}</p>
          )}
          {invoice.customer?.mobile && (
            <p style={p({ fontSize: "10px", color: "#64748b", margin: "0 0 1px 0" })}>T: {invoice.customer.mobile}</p>
          )}
          {invoice.customer?.email && (
            <p style={p({ fontSize: "10px", color: "#64748b", margin: "0 0 1px 0" })}>{invoice.customer.email}</p>
          )}
          {invoice.customer?.address && (
            <p style={p({ fontSize: "10px", color: "#94a3b8", margin: 0 })}>{invoice.customer.address}</p>
          )}
        </div>

        {/* Invoice Meta */}
        <div style={p({
          flex: "0 0 42%",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "12px 14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        })}>
          <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "11px" })}>
            <tbody>
              <tr style={p({ borderBottom: "1px solid #f1f5f9" })}>
                <td style={p({ padding: "5px 0", color: "#64748b", fontWeight: 600 })}>Invoice No.</td>
                <td style={p({ padding: "5px 0", textAlign: "right", fontWeight: 700, color: "#0f172a" })}>{invoice.invoiceNumber}</td>
              </tr>
              <tr style={p({ borderBottom: "1px solid #f1f5f9" })}>
                <td style={p({ padding: "5px 0", color: "#64748b", fontWeight: 600 })}>Date</td>
                <td style={p({ padding: "5px 0", textAlign: "right", color: "#334155" })}>{formatDate(invoice.date)}</td>
              </tr>
              {invoice.quotationId && (
                <tr style={p({ borderBottom: "1px solid #f1f5f9" })}>
                  <td style={p({ padding: "5px 0", color: "#64748b", fontWeight: 600 })}>Ref. Quotation</td>
                  <td style={p({ padding: "5px 0", textAlign: "right", color: "#334155" })}>{invoice.quotationId}</td>
                </tr>
              )}
              <tr>
                <td style={p({ padding: "5px 0", color: "#64748b", fontWeight: 600 })}>Status</td>
                <td style={p({ padding: "5px 0", textAlign: "right" })}>
                  <span style={statusBadgeStyle(invoice.status)}>{invoice.status}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ITEM SECTIONS ─────────────────────────────────── */}
      <div style={p({ padding: "14px 20mm 0 20mm", position: "relative", zIndex: 1 })}>
        {categoryOrder.map((cat) => {
          const catItems = grouped[cat];
          const catSubtotal = catItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
          const catDiscount = catItems.reduce((s, i) => s + (i.discount || 0), 0);
          const catTotal = catSubtotal - catDiscount;

          return (
            <div key={cat} style={p({ marginBottom: "16px" })}>
              {/* Category header */}
              <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "11px" })}>
                <thead>
                  <tr style={p({ background: NAVY })}>
                    <th style={p({ padding: "8px 10px", textAlign: "left", color: "#fff", fontWeight: 700, fontSize: "11px", width: "58%", borderRadius: "0" })}>{cat}</th>
                    <th style={p({ padding: "8px 10px", textAlign: "center", color: "#cbd5e1", fontWeight: 600, fontSize: "10.5px", width: "8%" })}>Qty</th>
                    <th style={p({ padding: "8px 10px", textAlign: "right", color: "#cbd5e1", fontWeight: 600, fontSize: "10.5px", width: "17%" })}>Unit Price</th>
                    <th style={p({ padding: "8px 10px", textAlign: "right", color: "#fff", fontWeight: 700, fontSize: "10.5px", width: "17%" })}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {catItems.map((item, idx) => (
                    <tr key={item.id} style={p({ background: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" })}>
                      <td style={p({ padding: "8px 10px", verticalAlign: "top" })}>
                        <span style={p({ fontWeight: 700, color: "#0f172a" })}>{item.name}</span>
                        {item.description && (
                          <><br /><span style={p({ fontWeight: 400, fontSize: "10.5px", color: "#64748b" })}>{renderBold(item.description)}</span></>
                        )}
                        {item.warranty && (
                          <><br /><span style={p({ fontStyle: "italic", fontSize: "10px", color: "#94a3b8" })}>{item.warranty}</span></>
                        )}
                      </td>
                      <td style={p({ padding: "8px 10px", textAlign: "center", verticalAlign: "top", color: "#334155" })}>{item.quantity}</td>
                      <td style={p({ padding: "8px 10px", textAlign: "right", verticalAlign: "top", color: "#334155", whiteSpace: "nowrap" })}>
                        {item.unitPrice === 0 ? <span style={p({ color: PAID_GREEN, fontWeight: 600 })}>Free</span> : formatCurrency(item.unitPrice)}
                      </td>
                      <td style={p({ padding: "8px 10px", textAlign: "right", verticalAlign: "top", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" })}>
                        {item.total === 0 ? <span style={p({ color: PAID_GREEN, fontWeight: 600 })}>Free</span> : formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Category subtotal row */}
              <div style={p({ display: "flex", justifyContent: "flex-end", background: "#f1f5f9", borderTop: "2px solid #e2e8f0", padding: "0" })}>
                <table style={p({ borderCollapse: "collapse", fontSize: "10.5px", minWidth: "240px" })}>
                  <tbody>
                    {catDiscount > 0 && (
                      <>
                        <tr>
                          <td style={p({ padding: "4px 16px 4px 10px", color: "#64748b" })}>Sub Total</td>
                          <td style={p({ padding: "4px 10px 4px 0", textAlign: "right", minWidth: "100px", color: "#334155" })}>{formatCurrency(catSubtotal)}</td>
                        </tr>
                        <tr>
                          <td style={p({ padding: "4px 16px 4px 10px", color: "#64748b" })}>Discount</td>
                          <td style={p({ padding: "4px 10px 4px 0", textAlign: "right", color: CANCEL_RED })}>-{formatCurrency(catDiscount)}</td>
                        </tr>
                      </>
                    )}
                    <tr style={p({ borderTop: catDiscount > 0 ? "1px solid #cbd5e1" : "none" })}>
                      <td style={p({ padding: "5px 16px 5px 10px", fontWeight: 700, color: NAVY_LIGHT })}>{cat} Total</td>
                      <td style={p({ padding: "5px 10px 5px 0", textAlign: "right", fontWeight: 700, color: NAVY_LIGHT })}>{formatCurrency(catTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* ── GRAND TOTAL BOX ─────────────────────────────── */}
        <div style={p({ display: "flex", justifyContent: "flex-end", margin: "4px 0 18px 0" })}>
          <div style={p({
            background: NAVY,
            borderRadius: "6px",
            padding: "10px 16px 10px 24px",
            display: "flex",
            alignItems: "center",
            gap: "40px",
            minWidth: "260px",
          })}>
            <span style={p({ color: "#94a3b8", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px" })}>GRAND TOTAL</span>
            <span style={p({ color: "#fff", fontSize: "15px", fontWeight: 900, marginLeft: "auto" })}>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* ── NOTE ─────────────────────────────────────────── */}
        {(invoice.note || DEFAULT_NOTE) && (
          <div style={p({
            borderLeft: `4px solid ${ACCENT}`,
            background: "#f8fafc",
            padding: "9px 12px",
            marginBottom: "18px",
            borderRadius: "0 4px 4px 0",
          })}>
            <p style={p({ fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", color: ACCENT, marginBottom: "4px", letterSpacing: "1px" })}>NOTE:</p>
            <p style={p({ fontSize: "10px", lineHeight: 1.7, color: "#475569", margin: 0 })}>{invoice.note || DEFAULT_NOTE}</p>
          </div>
        )}
      </div>

      {/* ── FOOTER BAR ───────────────────────────────────── */}
      <div style={p({
        background: NAVY,
        padding: "9px 20mm",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "28px",
        flexWrap: "wrap",
        marginTop: "auto",
      })}>
        {businessPhone && (
          <span style={p({ color: "#94a3b8", fontSize: "10px" })}>
            Mobile: <strong style={p({ color: "#e2e8f0" })}>{businessPhone}</strong>
          </span>
        )}
        {businessEmail && (
          <span style={p({ color: "#94a3b8", fontSize: "10px" })}>
            E-Mail: <strong style={p({ color: "#e2e8f0" })}>{businessEmail}</strong>
          </span>
        )}
        {businessWeb && (
          <span style={p({ color: "#94a3b8", fontSize: "10px" })}>
            Web: <strong style={p({ color: "#e2e8f0" })}>{businessWeb}</strong>
          </span>
        )}
        {!businessPhone && !businessEmail && !businessWeb && (
          <span style={p({ color: "#94a3b8", fontSize: "10px" })}>{businessName} — Thank you for your business!</span>
        )}
      </div>

    </div>
  );
}


interface PrintableInvoiceProps {
  invoice: Invoice;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWeb?: string;
}

const p = (s: React.CSSProperties): React.CSSProperties => s;

export default function PrintableInvoice({
  invoice,
  businessName = "Zero Pos",
  businessPhone,
  businessEmail,
  businessWeb,
}: PrintableInvoiceProps) {
  const items = invoice.items ?? [];

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

  const grandTotal = invoice.grandTotal;

  const statusColor =
    invoice.status === "Paid" ? "#1a7a1a"
    : invoice.status === "Cancelled" ? "#900"
    : "#555";

  return (
    <div
      id="printable-invoice"
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

      {/* DATE / INVOICE# top right */}
      {/* 3-COLUMN HEADER */}
      <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "flex-start" })}>

        {/* LEFT: logo + company contact */}
        <div style={p({ flex: "0 0 38%" })}>
          <img src="/logo-bw.png" alt="Zero Pos" style={p({ width: "100px", marginBottom: "8px", marginTop: "-8px", display: "block" })} />
          <p style={p({ fontWeight: 700, fontSize: "12px", margin: "0 0 3px 0" })}>{businessName}</p>
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
        <div style={p({ flex: "0 0 26%", textAlign: "center", paddingTop: "28px" })}>
          <h1 style={p({ fontWeight: 700, fontSize: "26px", margin: 0, letterSpacing: "0.5px" })}>
            Invoice
          </h1>
        </div>

        {/* RIGHT: date/invoice# then TO: customer */}
        <div style={p({ flex: "0 0 30%", textAlign: "right" })}>
          {/* Date & Invoice No */}
          <div style={p({ lineHeight: 1.8, fontSize: "11px", marginBottom: "10px" })}>
            <span style={p({ fontWeight: 700 })}>DATE:&nbsp;&nbsp;</span>{formatDate(invoice.date)}<br />
            <span style={p({ fontWeight: 700 })}>Invoice No:&nbsp;&nbsp;</span>#{invoice.invoiceNumber}<br />
            <span style={p({ fontWeight: 700, color: statusColor })}>{invoice.status}</span>
          </div>
          {/* TO: */}
          <p style={p({ fontWeight: 700, fontSize: "11px", margin: "0 0 3px 0" })}>TO:</p>
          <p style={p({ fontWeight: 700, fontSize: "12px", margin: "0 0 2px 0" })}>{invoice.customer?.name ?? ""}</p>
          {invoice.customer?.businessName && (
            <p style={p({ fontSize: "10px", color: "#333", margin: "0 0 1px 0" })}>{invoice.customer.businessName}</p>
          )}
          {invoice.customer?.mobile && (
            <p style={p({ fontSize: "10px", color: "#333", margin: "0 0 1px 0" })}>T: {invoice.customer.mobile}</p>
          )}
          {invoice.customer?.email && (
            <p style={p({ fontSize: "10px", color: "#333", margin: "0 0 1px 0" })}>{invoice.customer.email}</p>
          )}
          {invoice.customer?.address && (
            <p style={p({ fontSize: "10px", color: "#555", margin: 0 })}>{invoice.customer.address}</p>
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
      {(invoice.note || DEFAULT_NOTE) && (
        <div style={p({ border: "1px solid #ccc", padding: "8px 10px", marginBottom: "16px", background: "#fafafa" })}>
          <p style={p({ fontWeight: 700, fontSize: "10px", textTransform: "uppercase", marginBottom: "4px" })}>Note:</p>
          <p style={p({ fontSize: "10px", lineHeight: 1.7, color: "#333", margin: 0 })}>{invoice.note || DEFAULT_NOTE}</p>
        </div>
      )}

      {/* FOOTER */}
      <div style={p({ borderTop: "1px solid #999", paddingTop: "6px", textAlign: "center", fontSize: "10px", color: "#444" })}>
        {businessPhone && <span>Mobile: <strong>{businessPhone}</strong></span>}
        {businessPhone && businessEmail && <span>&nbsp;&nbsp;&nbsp;E-Mail: <strong>{businessEmail}</strong></span>}
        {!businessPhone && businessEmail && <span>E-Mail: <strong>{businessEmail}</strong></span>}
        {businessWeb && <span>&nbsp;&nbsp;&nbsp;Web: <strong>{businessWeb}</strong></span>}
        {!businessPhone && !businessEmail && !businessWeb && <span>{businessName} — Thank you for your business!</span>}
      </div>

    </div>
  );
}
