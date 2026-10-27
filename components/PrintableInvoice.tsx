import { renderBold } from "@/components/ItemTable";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";

interface PrintableInvoiceProps {
  invoice: Invoice;
  businessName?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWeb?: string;
  businessLogoUrl?: string;
}

const p = (s: React.CSSProperties): React.CSSProperties => s;

// ── Ivory + Ink palette ───────────────────────────────────────
// Warm, premium, print-safe. No heavy black slabs — hairline rules
// and generous white space carry the structure instead.
const INK    = "#1c1a17"; // primary ink — headings, totals, key figures
const INK2   = "#39342d"; // strong body text
const MUTE   = "#6f685d"; // secondary text / labels
const FAINT   = "#9b9388"; // tertiary text / captions
const LINE    = "#e7e1d6"; // hairline rule (warm)
const LINE2   = "#cfc7b8"; // emphasis rule
const PAPER   = "#ffffff"; // main paper (pure white — crisp, premium print)
const IVORY   = "#faf7f0"; // panels / alt rows
const RED     = "#a8442f"; // muted brick — discounts

// ── Warranty data (English + Sinhala) ─────────────────────────
const W_EN = [
  {
    t: "Hardware Warranty",
    b: "Printers, cash drawers, UPS units, and barcode scanners are covered by a 1-year warranty from the invoice date. PCs and monitors are used items and are covered by a 3-month shop warranty.",
  },
  {
    t: "Software Support",
    b: "Software includes Lifetime Bug-Fix Support for the agreed system features only.",
  },
  {
    t: "Scope of Warranty",
    b: "Warranty applies only to products and services supplied by Zero Pos Solutions.",
  },
  {
    t: "Exclusions",
    b: "Warranty does not cover physical damage, water damage, fire damage, power issues, or misuse.",
  },
  {
    t: "Warranty Void Conditions",
    b: "Unauthorized repairs, opening devices, removing warranty stickers, or tampering with serial numbers will void the warranty.",
  },
  {
    t: "Additional Changes & Development",
    b: "Small additional changes or minor adjustments may be provided free of charge where possible. However, major new features, new modules, custom reports, or major business logic changes may include an additional development charge.",
  },
  {
    t: "Third-Party & Infrastructure Issues",
    b: "Internet issues, network issues, printer driver issues, operating system issues, and third-party software issues are not covered under warranty.",
  },
  {
    t: "Warranty Claim Requirements",
    b: "Warranty claims require the original invoice and product serial number or warranty sticker where applicable.",
  },
  {
    t: "Support Methods",
    b: "Remote support may be provided through AnyDesk or similar tools. On-site support may include a service charge depending on the issue and location.",
  },
  {
    t: "Customer Responsibilities",
    b: "Customers are responsible for keeping regular data backups and using the system according to the provided guidance.",
  },
];

const W_SI = [
  {
    t: "Hardware Warranty",
    b: "Printers, cash drawers, UPS, සහ barcode scanners සඳහා invoice date එකේ සිට අවුරුදු 1ක warranty එකක් ලබාදේ. PC සහ monitor used උපකරණ නිසා මාස 3ක shop warranty එකක් ලබාදේ.",
  },
  {
    t: "Software Support",
    b: "Software සඳහා එකඟ වූ system features වල bugs පමණක් lifetime bug-fixing support යටතේ නිවැරදි කරදේ.",
  },
  {
    t: "Warranty ආවරණය",
    b: "Warranty එක අදාළ වන්නේ Zero Pos Solutions විසින් ලබාදුන් products සහ services සඳහා පමණි.",
  },
  {
    t: "ආවරණය නොවන කොන්දේසි",
    b: "Physical damage, water damage, fire damage, power issues, හෝ misuse warranty එකට ඇතුළත් නොවේ.",
  },
  {
    t: "Warranty නිෂ්ඵල වන අවස්ථා",
    b: "Unauthorized repairs, device open කිරීම, warranty sticker remove කිරීම, හෝ serial number tamper කිරීම warranty void වීමට හේතු වේ.",
  },
  {
    t: "අමතර වෙනස්කම් සහ Development",
    b: "කුඩා additional changes හෝ minor adjustments හැකි අවස්ථාවලදී free ලෙස ලබාදිය හැක. නමුත් major new features, new modules, custom reports, හෝ major business logic changes සඳහා additional development charge එකක් අදාළ විය හැක.",
  },
  {
    t: "Third-Party සහ Infrastructure ගැටළු",
    b: "Internet issues, network issues, printer driver issues, operating system issues, සහ third-party software issues warranty එකට ඇතුළත් නොවේ.",
  },
  {
    t: "Warranty Claim සඳහා අවශ්‍යතා",
    b: "Warranty claim සඳහා original invoice එක සහ product serial number හෝ warranty sticker තිබේ නම් අවශ්‍ය වේ.",
  },
  {
    t: "Support ක්‍රම",
    b: "AnyDesk වැනි tools හරහා remote support ලබාදිය හැක. On-site support සඳහා issue එක සහ location එක අනුව service charge එකක් අදාළ විය හැක.",
  },
  {
    t: "Customer වගකීම්",
    b: "Data backups තබාගැනීම සහ ලබාදුන් guidance අනුව system එක භාවිතා කිරීම customerගේ වගකීමකි.",
  },
];

function WSection({ items, title }: { items: typeof W_EN; title: string }) {
  return (
    <div style={p({ marginBottom: "14px" })}>
      {/* Section title — centered, hairline-ruled (no heavy box) */}
      <div style={p({ textAlign: "center", margin: "0 0 12px 0", borderTop: `1px solid ${LINE2}`, borderBottom: `1px solid ${LINE2}`, padding: "7px 0" })}>
        <span style={p({ fontSize: "12px", fontWeight: 700, letterSpacing: "3px", color: INK, textTransform: "uppercase" })}>{title}</span>
      </div>

      {items.map((w, i) => (
        <div key={i} style={p({ display: "flex", gap: "9px", marginBottom: "7px", alignItems: "flex-start" })}>
          <span style={p({ fontWeight: 700, fontSize: "11px", color: FAINT, minWidth: "16px", paddingTop: "2px", letterSpacing: "0.5px" })}>{String(i + 1).padStart(2, "0")}</span>
          <div style={p({ flex: 1 })}>
            <span style={p({ fontWeight: 700, fontSize: "11px", color: INK })}>{w.t}</span>
            <span style={p({ fontSize: "11px", color: MUTE })}> — {w.b}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PrintableInvoice({
  invoice,
  businessName = "Zero Pos Solutions",
  businessPhone = "077 787 7345 / 076 332 7419",
  businessEmail = "zeropossolutions@gmail.com",
  businessLogoUrl,
}: PrintableInvoiceProps) {
  const items = invoice.items ?? [];

  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = item.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }
  const PRIORITY = ["Software", "Hardware", "Service", "Support", "General"];
  const categoryOrder = Object.keys(grouped).sort((a, b) => {
    const ai = PRIORITY.indexOf(a);
    const bi = PRIORITY.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const computedTotal = items.reduce((s, i) => s + (i.total ?? i.quantity * i.unitPrice - (i.discount ?? 0)), 0);
  const grandTotal = typeof invoice.grandTotal === "number" && !isNaN(invoice.grandTotal) ? invoice.grandTotal : computedTotal;
  const isPaid = invoice.status === "Paid";
  const advancePaid = typeof invoice.advancePaid === "number" && invoice.advancePaid > 0 ? invoice.advancePaid : 0;
  const balanceDue = grandTotal - advancePaid;

  const logo = businessLogoUrl || "/logo.png";

  // ── Header (Ivory + Ink, hairline rule, no black bar) ──
  const Header = () => (
    <div style={p({ background: PAPER, padding: "16px 13mm 0 13mm", pageBreakInside: "avoid", WebkitPrintColorAdjust: "exact" })}>
      <div style={p({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
        {/* Logo — shown large; the logo image already contains the company name */}
        <img src={logo} alt={businessName} style={p({ height: "70px", width: "auto", objectFit: "contain", display: "block" })} />

        <div style={p({ textAlign: "right" })}>
          <div style={p({ fontSize: "22px", fontWeight: 300, letterSpacing: "7px", color: FAINT, textTransform: "uppercase", marginBottom: "5px" })}>Invoice</div>
          <div style={p({ color: MUTE, fontSize: "11.5px", letterSpacing: "0.2px" })}>
            {businessPhone && <span>{businessPhone}</span>}
            {businessPhone && businessEmail && <span style={p({ margin: "0 7px", color: FAINT })}>•</span>}
            {businessEmail && <span>{businessEmail}</span>}
          </div>
        </div>
      </div>

      {/* full-width hairline under header */}
      <div style={p({ height: "1px", background: INK, marginTop: "14px" })} />
    </div>
  );

  function sanitizeName(n?: string) {
    if (!n) return n;
    return n
      .replace(/Life Time Bugs Warranty/gi, "Lifetime Bug-Fix Support")
      .replace(/Day End Email Service/gi, "Daily End Report Email Service")
      .replace(/Technical Support & Product Setup/gi, "Technical Support & System Setup");
  }

  return (
    <div
      id="printable-invoice"
      style={p({ fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif", fontSize: "12px", color: INK, background: "#e8e6e1" })}
    >

      {/* ══════════════════════════════════════════════════ */}
      {/* PAGE 1 — INVOICE                                  */}
      {/* ══════════════════════════════════════════════════ */}
      <div className="print-page" style={p({ background: PAPER, width: "210mm", margin: "0 auto", boxSizing: "border-box", position: "relative", display: "flex", flexDirection: "column", pageBreakAfter: "always", minHeight: "297mm", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" })}>

        {isPaid && (
          <div style={p({ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%) rotate(-26deg)", fontSize: "92px", fontWeight: 800, color: INK, opacity: 0.04, letterSpacing: "10px", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", zIndex: 0 })}>PAID</div>
        )}

        <Header />

        {/* ── BILL TO + META ── */}
        <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 13mm 14px 13mm", gap: "24px", position: "relative", zIndex: 1 })}>
          <div style={p({ flex: "1 1 0" })}>
            <p style={p({ fontSize: "10px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: FAINT, margin: "0 0 7px 0" })}>Billed To</p>
            <p style={p({ fontWeight: 800, fontSize: "14px", margin: "0 0 3px 0", color: INK })}>{invoice.customer?.name ?? "—"}</p>
            {invoice.customer?.businessName && <p style={p({ fontSize: "11px", color: INK2, margin: "0 0 1px 0" })}>{invoice.customer.businessName}</p>}
            {invoice.customer?.mobile       && <p style={p({ fontSize: "11.5px", color: MUTE, margin: "0 0 1px 0" })}>T: {invoice.customer.mobile}</p>}
            {invoice.customer?.email        && <p style={p({ fontSize: "11.5px", color: MUTE, margin: "0 0 1px 0" })}>{invoice.customer.email}</p>}
            {invoice.customer?.address      && <p style={p({ fontSize: "11.5px", color: FAINT, margin: 0 })}>{invoice.customer.address}</p>}
          </div>

          <div style={p({ flex: "0 0 200px", boxSizing: "border-box" })}>
            <div style={p({ display: "flex", flexDirection: "column", gap: "0" })}>
              <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0 7px 0", borderBottom: `1px solid ${LINE}` })}>
                <div style={p({ fontSize: "10.5px", fontWeight: 700, color: FAINT, textTransform: "uppercase", letterSpacing: "1.5px" })}>Invoice No.</div>
                <div style={p({ fontSize: "13px", fontWeight: 800, color: INK })}>{invoice.invoiceNumber ?? "—"}</div>
              </div>
              <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0 0 0" })}>
                <div style={p({ fontSize: "10.5px", fontWeight: 700, color: FAINT, textTransform: "uppercase", letterSpacing: "1.5px" })}>Date</div>
                <div style={p({ fontSize: "12px", fontWeight: 600, color: INK2 })}>{invoice.date ? formatDate(invoice.date) : "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ITEMS ── */}
        <div style={p({ padding: "0 13mm 0 13mm", flex: 1, position: "relative", zIndex: 1 })}>
          {categoryOrder.map((cat) => {
            const catItems  = grouped[cat];
            const catSub    = catItems.reduce((s, i) => s + (i.quantity ?? 0) * (i.unitPrice ?? 0), 0);
            const catDisc   = catItems.reduce((s, i) => s + (i.discount ?? 0), 0);
            const catTotal  = catSub - catDisc;

            return (
              <div key={cat} style={p({ marginBottom: "16px" })}>
                <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "11px" })}>
                  <thead>
                    {/* Category header — ink text + hairline rule, no filled bar */}
                    <tr>
                      <th style={p({ padding: "0 9px 6px 0", textAlign: "left",   color: INK,  fontWeight: 800, width: "53%", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: `1.5px solid ${INK}` })}>{cat}</th>
                      <th style={p({ padding: "0 9px 6px 9px", textAlign: "center", color: FAINT, fontWeight: 700, width: "9%",  fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: `1.5px solid ${INK}` })}>Qty</th>
                      <th style={p({ padding: "0 9px 6px 9px", textAlign: "right",  color: FAINT, fontWeight: 700, width: "19%", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: `1.5px solid ${INK}` })}>Unit Price</th>
                      <th style={p({ padding: "0 0 6px 9px", textAlign: "right",  color: FAINT, fontWeight: 700, width: "19%", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", borderBottom: `1.5px solid ${INK}` })}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item) => (
                      <tr key={item.id} style={p({ borderBottom: `1px solid ${LINE}` })}>
                        <td style={p({ padding: "9px 9px 9px 0", verticalAlign: "top" })}>
                          <span style={p({ fontWeight: 700, color: INK, display: "block", fontSize: "11.5px" })}>{sanitizeName(item.name)}</span>
                          {item.description && <span style={p({ fontSize: "11.5px", color: MUTE, display: "block", marginTop: "2px", lineHeight: 1.5 })}>{renderBold(item.description)}</span>}
                          {item.warranty    && <span style={p({ fontStyle: "italic", fontSize: "11px", color: FAINT, display: "block", marginTop: "2px" })}>{item.warranty}</span>}
                        </td>
                        <td style={p({ padding: "9px 9px", textAlign: "center", verticalAlign: "top", color: INK2, fontWeight: 600 })}>{item.quantity ? item.quantity : <span style={p({ color: FAINT })}>—</span>}</td>
                        <td style={p({ padding: "9px 9px", textAlign: "right", verticalAlign: "top", color: MUTE, whiteSpace: "nowrap" })}>
                          {(item.unitPrice ?? 0) === 0 ? <span style={p({ fontWeight: 700, color: INK, letterSpacing: "0.5px" })}>Free</span> : formatCurrency(item.unitPrice ?? 0)}
                        </td>
                        <td style={p({ padding: "9px 0 9px 9px", textAlign: "right", verticalAlign: "top", fontWeight: 700, color: INK, whiteSpace: "nowrap" })}>
                          {(item.total ?? 0) === 0 ? <span style={p({ fontWeight: 700, color: INK, letterSpacing: "0.5px" })}>Free</span> : formatCurrency(item.total ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Category subtotal — right aligned, no filled band */}
                <div style={p({ display: "flex", justifyContent: "flex-end", marginTop: "2px" })}>
                  <table style={p({ borderCollapse: "collapse", fontSize: "11.5px", minWidth: "230px" })}>
                    <tbody>
                      {catDisc > 0 && (
                        <>
                          <tr>
                            <td style={p({ padding: "3px 14px 3px 8px", color: MUTE })}>Sub Total</td>
                            <td style={p({ padding: "3px 0 3px 0", textAlign: "right", minWidth: "100px", color: INK2 })}>{formatCurrency(catSub)}</td>
                          </tr>
                          <tr>
                            <td style={p({ padding: "3px 14px 3px 8px", color: MUTE })}>Discount</td>
                            <td style={p({ padding: "3px 0 3px 0", textAlign: "right", color: RED })}>−{formatCurrency(catDisc)}</td>
                          </tr>
                        </>
                      )}
                      <tr style={p({ borderTop: `1px solid ${LINE2}` })}>
                        <td style={p({ padding: "5px 14px 0 8px", fontWeight: 700, color: INK, textTransform: "uppercase", letterSpacing: "1px", fontSize: "11px" })}>{cat} Total</td>
                        <td style={p({ padding: "5px 0 0 0",  fontWeight: 800, color: INK, textAlign: "right", fontSize: "12px" })}>{formatCurrency(catTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* ── GRAND TOTAL + PAYMENT SUMMARY ── */}
          <div style={p({ display: "flex", justifyContent: "flex-end", margin: "6px 0 18px 0", minWidth: 0 })}>
            <div style={p({ width: "280px", maxWidth: "100%", minWidth: 0, border: `1.5px solid ${INK}`, borderRadius: "4px", overflow: "hidden" })}>
              <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "11px 16px", background: IVORY })}>
                <span style={p({ color: MUTE, fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" })}>Grand Total</span>
                <span style={p({ color: INK, fontSize: "16px", fontWeight: 800, whiteSpace: "nowrap" })}>{formatCurrency(grandTotal)}</span>
              </div>

              {advancePaid > 0 && (
                <>
                  <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "8px 16px", borderTop: `1px solid ${LINE}`, background: PAPER })}>
                    <span style={p({ color: MUTE, fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" })}>Advance Paid</span>
                    <span style={p({ color: RED, fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" })}>−{formatCurrency(advancePaid)}</span>
                  </div>
                  <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "10px 16px", background: INK, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" })}>
                    <span style={p({ color: "#cfc7b8", fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" })}>Remaining Balance</span>
                    <span style={p({ color: "#ffffff", fontSize: "15px", fontWeight: 800, whiteSpace: "nowrap" })}>{formatCurrency(balanceDue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── NOTE (only if explicitly set) ── */}
          {invoice.note && (
            <div style={p({ background: IVORY, borderLeft: `2px solid ${LINE2}`, padding: "10px 14px", marginBottom: "14px", borderRadius: "0 4px 4px 0" })}>
              <p style={p({ fontWeight: 700, fontSize: "10.5px", textTransform: "uppercase", color: FAINT, margin: "0 0 5px 0", letterSpacing: "1.5px" })}>Note</p>
              <p style={p({ fontSize: "11px", lineHeight: 1.6, color: INK2, margin: 0 })}>
                {invoice.note.replace(/We will visit your location and complete the full POS system setup\.?\s*/gi, "").trim()}
              </p>
            </div>
          )}

          {/* ── SIGNATURES ── */}
          <div style={p({ marginBottom: "20px", marginTop: "auto", paddingTop: "20px" })}>
            <div style={p({ display: "flex", justifyContent: "space-between", gap: "20px" })}>
              {[
                { title: "Authorized By", role: "Co-Founder", sub: businessName },
                { title: "Prepared By",   role: "Co-Founder", sub: businessName },
                { title: "Accepted By",   role: "Client", sub: invoice.customer?.name || "Customer Acknowledgement" },
              ].map((s, i) => (
                <div key={i} style={p({ flex: "1 1 0", textAlign: "center" })}>
                  <div style={p({ borderBottom: `1px solid ${LINE2}`, height: "34px", marginBottom: "7px" })} />
                  <p style={p({ fontSize: "11.5px", fontWeight: 800, color: INK, margin: "0 0 2px 0", letterSpacing: "0.3px" })}>{s.title}</p>
                  <p style={p({ fontSize: "10.5px", fontWeight: 600, color: MUTE,  margin: "0 0 1px 0" })}>{s.role}</p>
                  <p style={p({ fontSize: "10.5px",  color: FAINT, margin: 0 })}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER — hairline rule, light text, no black bar ── */}
        <div style={p({ padding: "10px 13mm 12px 13mm", borderTop: `1px solid ${INK}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", pageBreakAfter: "always", pageBreakInside: "avoid" })}>
          <span style={p({ color: FAINT, fontSize: "11px", letterSpacing: "0.5px" })}>{businessName}</span>
          <span style={p({ color: MUTE, fontSize: "11px" })}>
            {businessPhone && <>{businessPhone}</>}
            {businessPhone && businessEmail && <span style={p({ margin: "0 8px", color: FAINT })}>•</span>}
            {businessEmail && <>{businessEmail}</>}
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* PAGE 2 — WARRANTY CONDITIONS                      */}
      {/* ══════════════════════════════════════════════════ */}
      <div className="print-page" style={p({ background: PAPER, width: "210mm", margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", pageBreakBefore: "always", minHeight: "297mm", position: "relative", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" })}>

        <Header />

        {/* ── INVOICE REF BAR ── */}
        <div style={p({ padding: "10px 13mm 12px 13mm", display: "flex", gap: "26px", flexWrap: "wrap" })}>
          <span style={p({ fontSize: "10.5px", color: MUTE })}>Invoice <strong style={p({ color: INK, marginLeft: "3px" })}>{invoice.invoiceNumber ?? "—"}</strong></span>
          {invoice.customer?.name && <span style={p({ fontSize: "10.5px", color: MUTE })}>Customer <strong style={p({ color: INK, marginLeft: "3px" })}>{invoice.customer.name}</strong></span>}
          {invoice.date           && <span style={p({ fontSize: "10.5px", color: MUTE })}>Date <strong style={p({ color: INK, marginLeft: "3px" })}>{formatDate(invoice.date)}</strong></span>}
        </div>

        {/* ── WARRANTY CONTENT ── */}
        <div style={p({ padding: "0 13mm 10px 13mm", flex: 1 })}>
          <WSection items={W_EN} title="Warranty Terms & Conditions" />
          <WSection items={W_SI} title="වගකීම් සහ කොන්දේසි" />
        </div>

        {/* ── FOOTER ── */}
        <div style={p({ padding: "10px 13mm 12px 13mm", borderTop: `1px solid ${INK}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", pageBreakInside: "avoid" })}>
          <span style={p({ color: FAINT, fontSize: "11px", letterSpacing: "0.5px" })}>{businessName}</span>
          <span style={p({ color: MUTE, fontSize: "11px" })}>
            {businessPhone && <>{businessPhone}</>}
            {businessPhone && businessEmail && <span style={p({ margin: "0 8px", color: FAINT })}>•</span>}
            {businessEmail && <>{businessEmail}</>}
          </span>
        </div>
      </div>

    </div>
  );
}
