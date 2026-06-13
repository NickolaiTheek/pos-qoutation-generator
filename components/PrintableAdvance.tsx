import { amountInWordsLKR, formatCurrency, formatDate } from "@/lib/utils";
import type { Quotation } from "@/types";

interface PrintableAdvanceProps {
  quotation: Quotation;
  advanceAmount?: number | null;
  paymentMethod?: string;
  receiptDate?: Date | string;
  receiptNumber?: string;
  businessName?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWeb?: string;
  businessLogoUrl?: string;
}

const p = (s: React.CSSProperties): React.CSSProperties => s;

// ── Ivory + Ink palette (shared brand language) ───────────────
const INK    = "#1c1a17";
const INK2   = "#39342d";
const MUTE   = "#6f685d";
const FAINT  = "#9b9388";
const LINE   = "#e7e1d6";
const LINE2  = "#cfc7b8";
const PAPER  = "#ffffff";
const IVORY  = "#faf7f0";
const RED    = "#a8442f";

export default function PrintableAdvance({
  quotation,
  advanceAmount,
  paymentMethod,
  receiptDate,
  receiptNumber,
  businessName = "Zero Pos Solutions",
  businessPhone = "077 787 7345 / 076 332 7419",
  businessEmail = "zeropossolutions@gmail.com",
  businessWeb,
  businessLogoUrl,
}: PrintableAdvanceProps) {
  const logo = businessLogoUrl || "/logo.png";

  const grandTotal = quotation.grandTotal ?? 0;
  const items = quotation.items ?? [];
  const hasAdvance = typeof advanceAmount === "number" && advanceAmount > 0;
  const advance = hasAdvance ? (advanceAmount as number) : 0;
  const balance = grandTotal - advance;

  const refNo =
    receiptNumber ||
    `ADV-${(quotation.quotationNumber || "").replace(/[^0-9]/g, "") || "00000"}`;

  const methods = ["Cash", "Bank Transfer", "Card", "Cheque"];

  // Ruled blank line for manual pen entry when a value is not provided.
  const Blank = ({ w = "150px" }: { w?: string }) => (
    <span style={p({ display: "inline-block", minWidth: w, borderBottom: `1px solid ${LINE2}`, height: "1px", verticalAlign: "middle" })} />
  );

  return (
    <div
      id="printable-advance"
      style={p({ fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif", fontSize: "12px", color: INK, background: "#e8e6e1" })}
    >
      <div
        className="print-page"
        style={p({ background: PAPER, width: "210mm", minHeight: "297mm", margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", position: "relative", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" })}
      >

        {/* ── HEADER ── */}
        <div style={p({ background: PAPER, padding: "16px 13mm 0 13mm", pageBreakInside: "avoid", WebkitPrintColorAdjust: "exact" })}>
          <div style={p({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
            <img src={logo} alt={businessName} style={p({ height: "70px", width: "auto", objectFit: "contain", display: "block" })} />
            <div style={p({ textAlign: "right" })}>
              <div style={p({ fontSize: "16px", fontWeight: 300, letterSpacing: "3.5px", color: FAINT, textTransform: "uppercase", marginBottom: "5px" })}>Advance Receipt</div>
              <div style={p({ color: MUTE, fontSize: "11.5px", letterSpacing: "0.2px" })}>
                {businessPhone && <span>{businessPhone}</span>}
                {businessPhone && businessEmail && <span style={p({ margin: "0 7px", color: FAINT })}>•</span>}
                {businessEmail && <span>{businessEmail}</span>}
              </div>
            </div>
          </div>
          <div style={p({ height: "1px", background: INK, marginTop: "14px" })} />
        </div>

        {/* ── RECEIVED FROM + META ── */}
        <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 13mm 14px 13mm", gap: "24px" })}>
          <div style={p({ flex: "1 1 0" })}>
            <p style={p({ fontSize: "10px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: FAINT, margin: "0 0 7px 0" })}>Received From</p>
            <p style={p({ fontWeight: 800, fontSize: "14px", margin: "0 0 3px 0", color: INK })}>{quotation.customer?.name ?? "—"}</p>
            {quotation.customer?.businessName && <p style={p({ fontSize: "11px", color: INK2, margin: "0 0 1px 0" })}>{quotation.customer.businessName}</p>}
            {quotation.customer?.mobile       && <p style={p({ fontSize: "11.5px", color: MUTE, margin: "0 0 1px 0" })}>T: {quotation.customer.mobile}</p>}
            {quotation.customer?.email        && <p style={p({ fontSize: "11.5px", color: MUTE, margin: "0 0 1px 0" })}>{quotation.customer.email}</p>}
            {quotation.customer?.address      && <p style={p({ fontSize: "11.5px", color: FAINT, margin: 0 })}>{quotation.customer.address}</p>}
          </div>

          <div style={p({ flex: "0 0 210px", boxSizing: "border-box" })}>
            <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0 7px 0", borderBottom: `1px solid ${LINE}` })}>
              <div style={p({ fontSize: "10.5px", fontWeight: 700, color: FAINT, textTransform: "uppercase", letterSpacing: "1.5px" })}>Receipt No.</div>
              <div style={p({ fontSize: "13px", fontWeight: 800, color: INK })}>{refNo}</div>
            </div>
            <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${LINE}` })}>
              <div style={p({ fontSize: "10.5px", fontWeight: 700, color: FAINT, textTransform: "uppercase", letterSpacing: "1.5px" })}>Date</div>
              <div style={p({ fontSize: "12px", fontWeight: 600, color: INK2 })}>{receiptDate ? formatDate(receiptDate) : "—"}</div>
            </div>
            <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0 0 0" })}>
              <div style={p({ fontSize: "10.5px", fontWeight: 700, color: FAINT, textTransform: "uppercase", letterSpacing: "1.5px" })}>Ref. Quotation</div>
              <div style={p({ fontSize: "12px", fontWeight: 700, color: INK2 })}>{quotation.quotationNumber ?? "—"}</div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={p({ padding: "0 13mm", flex: 1, display: "flex", flexDirection: "column" })}>

          {/* Hero amount panel */}
          <div style={p({ border: `1.5px solid ${INK}`, borderRadius: "8px", background: IVORY, padding: "16px 26px", marginBottom: "20px" })}>
            <div style={p({ fontSize: "11px", fontWeight: 700, letterSpacing: "3.5px", textTransform: "uppercase", color: MUTE, marginBottom: "12px", textAlign: "center" })}>Advance Payment Received</div>

            {hasAdvance ? (
              <>
                <div style={p({ fontSize: "32px", fontWeight: 800, color: INK, letterSpacing: "0.5px", lineHeight: 1.05, textAlign: "center" })}>{formatCurrency(advance)}</div>
                <div style={p({ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${LINE2}`, fontSize: "11px", fontStyle: "italic", color: MUTE, textAlign: "center" })}>{amountInWordsLKR(advance)}</div>
              </>
            ) : (
              <>
                {/* Amount line — LKR label + full writing rule on one baseline */}
                <div style={p({ display: "flex", alignItems: "flex-end", gap: "12px" })}>
                  <span style={p({ fontSize: "28px", fontWeight: 800, color: INK, lineHeight: 1 })}>LKR</span>
                  <span style={p({ flex: 1, borderBottom: `1.5px solid ${INK}`, height: "26px" })} />
                </div>
              </>
            )}
          </div>

          {/* Payment summary + method */}
          <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "30px", marginBottom: "20px" })}>
            {/* Payment method */}
            <div style={p({ flex: "1 1 0", paddingTop: "4px" })}>
              <p style={p({ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: FAINT, margin: "0 0 9px 0" })}>Payment Method</p>
              <div style={p({ display: "flex", flexWrap: "wrap", gap: "8px 18px" })}>
                {methods.map((m) => {
                  const on = (paymentMethod || "").toLowerCase() === m.toLowerCase();
                  return (
                    <span key={m} style={p({ display: "inline-flex", alignItems: "center", gap: "6px" })}>
                      <span style={p({ width: "11px", height: "11px", border: `1.2px solid ${INK}`, borderRadius: "2px", background: on ? INK : "transparent", display: "inline-block", WebkitPrintColorAdjust: "exact" })} />
                      <span style={p({ fontSize: "11px", color: on ? INK : MUTE, fontWeight: on ? 700 : 400 })}>{m}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div style={p({ flex: "0 0 250px" })}>
              <div style={p({ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "11px" })}>
                <span style={p({ color: MUTE })}>Quotation Total</span>
                <span style={p({ color: INK2, fontWeight: 600 })}>{formatCurrency(grandTotal)}</span>
              </div>
              <div style={p({ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "11px", borderBottom: `1px solid ${LINE}` })}>
                <span style={p({ color: MUTE })}>Advance Paid</span>
                <span style={p({ color: RED, fontWeight: 600 })}>{hasAdvance ? <>−{formatCurrency(advance)}</> : <Blank w="90px" />}</span>
              </div>
              {hasAdvance ? (
                <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginTop: "8px", background: INK, borderRadius: "4px", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" })}>
                  <span style={p({ color: "#cfc7b8", fontSize: "11.5px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" })}>Balance Due</span>
                  <span style={p({ color: "#fff", fontSize: "13px", fontWeight: 800 })}>{formatCurrency(balance)}</span>
                </div>
              ) : (
                <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginTop: "8px", border: `1.5px solid ${INK}`, borderRadius: "4px" })}>
                  <span style={p({ fontSize: "11.5px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: INK })}>Balance Due</span>
                  <span style={p({ flex: 1, borderBottom: `1.5px solid ${INK}`, height: "20px", marginLeft: "16px" })} />
                </div>
              )}
            </div>
          </div>

          {/* Items covered by this advance */}
          {items.length > 0 && (
            <div style={p({ marginBottom: "20px" })}>
              <p style={p({ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: FAINT, margin: "0 0 8px 0" })}>Work Covered By This Advance</p>
              <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" })}>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id ?? i} style={p({ borderBottom: `1px solid ${LINE}` })}>
                      <td style={p({ padding: "6px 0", color: INK2, fontWeight: 600 })}>{item.name}</td>
                      <td style={p({ padding: "6px 0", textAlign: "right", color: MUTE, whiteSpace: "nowrap" })}>
                        {(item.total ?? 0) === 0 ? <span style={p({ color: FAINT })}>Included</span> : formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                  <tr style={p({ borderTop: `1.5px solid ${INK}` })}>
                    <td style={p({ padding: "7px 0 0 0", fontWeight: 800, color: INK, textTransform: "uppercase", letterSpacing: "1px", fontSize: "11px" })}>Quotation Total</td>
                    <td style={p({ padding: "7px 0 0 0", textAlign: "right", fontWeight: 800, color: INK, fontSize: "12px" })}>{formatCurrency(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Terms & acknowledgement */}
          <div style={p({ borderTop: `1px solid ${LINE}`, paddingTop: "14px" })}>
            <p style={p({ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: FAINT, margin: "0 0 9px 0" })}>Terms &amp; Acknowledgement</p>
            {[
              `This receipt acknowledges the advance payment received by ${businessName} from ${quotation.customer?.name ?? "the customer"} against Quotation ${quotation.quotationNumber ?? "—"}.`,
              "The advance is accepted toward the products and services listed in the referenced quotation above.",
              "The remaining balance is payable upon completion and delivery of the agreed work.",
              "This receipt is valid only with an authorized signature from both parties and should be retained for future reference.",
            ].map((t, i) => (
              <div key={i} style={p({ display: "flex", gap: "9px", marginBottom: "6px", alignItems: "flex-start" })}>
                <span style={p({ fontWeight: 700, fontSize: "10.5px", color: FAINT, minWidth: "14px", paddingTop: "1px", letterSpacing: "0.5px" })}>{String(i + 1).padStart(2, "0")}</span>
                <span style={p({ flex: 1, fontSize: "11.5px", lineHeight: 1.6, color: INK2 })}>{t}</span>
              </div>
            ))}
          </div>

          {/* Signatures */}
          <div style={p({ marginTop: "auto", paddingTop: "34px", marginBottom: "20px" })}>
            <div style={p({ display: "flex", justifyContent: "space-between", gap: "20px" })}>
              {[
                { title: "Received By", role: "Co-Founder", sub: businessName },
                { title: "Authorized By", role: "Co-Founder", sub: businessName },
                { title: "Paid By", role: "Client", sub: quotation.customer?.name || "Customer Acknowledgement" },
              ].map((s, i) => (
                <div key={i} style={p({ flex: "1 1 0", textAlign: "center" })}>
                  <div style={p({ borderBottom: `1px solid ${LINE2}`, height: "34px", marginBottom: "7px" })} />
                  <p style={p({ fontSize: "11.5px", fontWeight: 800, color: INK, margin: "0 0 2px 0", letterSpacing: "0.3px" })}>{s.title}</p>
                  <p style={p({ fontSize: "10.5px", fontWeight: 600, color: MUTE, margin: "0 0 1px 0" })}>{s.role}</p>
                  <p style={p({ fontSize: "10.5px", color: FAINT, margin: 0 })}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={p({ padding: "10px 13mm 12px 13mm", borderTop: `1px solid ${INK}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", pageBreakInside: "avoid" })}>
          <span style={p({ color: FAINT, fontSize: "11px", letterSpacing: "0.5px" })}>{businessName}</span>
          <span style={p({ color: MUTE, fontSize: "11px" })}>
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
