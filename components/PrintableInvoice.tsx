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

const BLACK  = "#0a0a0a";
const DARK   = "#1c1c1c";
const MID    = "#2e2e2e";
const GRAY   = "#555";
const LGRAY  = "#888";
const BORDER = "#d0d0d0";
const BG     = "#f8f8f8";
const BGROW  = "#fcfcfc";
const RED    = "#dc2626";

// ── Warranty data (English + Sinhala) ─────────────────────────
const W_EN = [
  {
    t: "Hardware Warranty",
    b: "Hardware items are covered by a 1-year shop warranty from the invoice date.",
  },
  {
    t: "Software Support",
    b: "Software includes lifetime bug-fixing support for the agreed system features only.",
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
    b: "Hardware items සඳහා invoice date එකේ සිට අවුරුදු 1ක shop warranty එකක් ලබාදේ.",
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
    <div style={p({ marginBottom: "10px" })}>
      {/* Section title box — OMYX style */}
      <div style={p({ border: `2px solid ${BLACK}`, textAlign: "center", padding: "4px 10px", marginBottom: "8px", display: "inline-block", width: "100%", boxSizing: "border-box" })}>
        <span style={p({ fontSize: "11px", fontWeight: 900, letterSpacing: "1px", color: BLACK, textTransform: "uppercase" })}>{title}</span>
      </div>

      {items.map((w, i) => (
        <div key={i} style={p({ display: "flex", gap: "6px", marginBottom: "5px", alignItems: "flex-start" })}>
          <span style={p({ fontWeight: 800, fontSize: "9px", color: BLACK, minWidth: "14px", paddingTop: "1px" })}>{i + 1}.</span>
          <div style={p({ flex: 1 })}>
            <span style={p({ fontWeight: 700, fontSize: "9px", color: BLACK })}>{w.t}: </span>
            <span style={p({ fontSize: "9px", color: MID, lineHeight: 1.5 })}>{w.b}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PrintableInvoice({
  invoice,
  businessName = "Zero Pos Solutions",
  businessPhone,
  businessEmail,
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

  const logo = businessLogoUrl || "/logo-bw.png";

  const Header = () => (
    <div style={p({ background: BLACK, padding: "12px 18mm", overflow: "hidden" })}>
      <div style={p({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
        <div style={p({ display: "flex", alignItems: "center", gap: "12px" })}>
          <div style={p({ width: "72px", height: "72px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" })}>
            <img src={logo} alt={businessName} style={p({ width: "60px", height: "60px", objectFit: "contain" })} />
          </div>
          <div>
            <div style={p({ color: "#fff", fontSize: "16px", fontWeight: 800 })}>{businessName}</div>
            <div style={p({ color: "#fff", fontSize: "11px", marginTop: "4px" })}>
              {businessPhone && <span>T: {businessPhone}</span>}
              {businessPhone && businessEmail && <span style={p({ margin: "0 6px" })}>•</span>}
              {businessEmail && <span>E: {businessEmail}</span>}
            </div>
          </div>
        </div>
        <div style={p({ minWidth: "120px" })} />
      </div>
    </div>
  );

  return (
    <div
      id="printable-invoice"
      style={p({ fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif", fontSize: "11px", color: BLACK, background: "#e8e8e8" })}
    >

      {/* ══════════════════════════════════════════════════ */}
      {/* PAGE 1 — INVOICE                                  */}
      {/* ══════════════════════════════════════════════════ */}
      <div style={p({ background: "#fff", width: "210mm", margin: "0 auto", boxSizing: "border-box", position: "relative", display: "flex", flexDirection: "column", pageBreakAfter: "always", minHeight: "297mm" })}>

        {isPaid && (
          <div style={p({ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%) rotate(-28deg)", fontSize: "90px", fontWeight: 900, color: "#000", opacity: 0.035, letterSpacing: "8px", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", zIndex: 0 })}>PAID</div>
        )}

        <Header />

        {/* ── BILL TO + META ── */}
        <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "13px 18mm 11px 18mm", gap: "18px", background: BG, borderBottom: `1px solid ${BORDER}`, position: "relative", zIndex: 1 })}>
          <div style={p({ flex: "1 1 0" })}>
            <p style={p({ fontSize: "8px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: GRAY, margin: "0 0 5px 0", borderBottom: `1.5px solid ${DARK}`, paddingBottom: "3px", display: "inline-block" })}>Bill To</p>
            <p style={p({ fontWeight: 800, fontSize: "13px", margin: "0 0 2px 0", color: BLACK })}>{invoice.customer?.name ?? "—"}</p>
            {invoice.customer?.businessName && <p style={p({ fontSize: "10px", color: MID, margin: "0 0 1px 0" })}>{invoice.customer.businessName}</p>}
            {invoice.customer?.mobile       && <p style={p({ fontSize: "9.5px", color: GRAY, margin: "0 0 1px 0" })}>T: {invoice.customer.mobile}</p>}
            {invoice.customer?.email        && <p style={p({ fontSize: "9.5px", color: GRAY, margin: "0 0 1px 0" })}>{invoice.customer.email}</p>}
            {invoice.customer?.address      && <p style={p({ fontSize: "9.5px", color: LGRAY, margin: 0 })}>{invoice.customer.address}</p>}
          </div>

          <div style={p({ flex: "0 0 185px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "10px 12px" })}>
            <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "10px" })}>
              <tbody>
                <tr style={p({ borderBottom: "1px solid #eee" })}>
                  <td style={p({ padding: "4px 0", color: GRAY, fontWeight: 600 })}>Invoice No.</td>
                  <td style={p({ padding: "4px 0", textAlign: "right", fontWeight: 800, color: BLACK })}>{invoice.invoiceNumber ?? "—"}</td>
                </tr>
                <tr>
                  <td style={p({ padding: "4px 0", color: GRAY, fontWeight: 600 })}>Date</td>
                  <td style={p({ padding: "4px 0", textAlign: "right", color: MID })}>{invoice.date ? formatDate(invoice.date) : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ITEMS ── */}
        <div style={p({ padding: "10px 18mm 0 18mm", flex: 1, position: "relative", zIndex: 1 })}>
          {categoryOrder.map((cat) => {
            const catItems  = grouped[cat];
            const catSub    = catItems.reduce((s, i) => s + (i.quantity ?? 0) * (i.unitPrice ?? 0), 0);
            const catDisc   = catItems.reduce((s, i) => s + (i.discount ?? 0), 0);
            const catTotal  = catSub - catDisc;

            return (
              <div key={cat} style={p({ marginBottom: "10px" })}>
                <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "10px" })}>
                  <thead>
                    <tr style={p({ background: DARK })}>
                      <th style={p({ padding: "7px 9px", textAlign: "left",   color: "#fff", fontWeight: 700, width: "53%" })}>{cat}</th>
                      <th style={p({ padding: "7px 9px", textAlign: "center", color: "#bbb", fontWeight: 600, width: "9%"  })}>Qty</th>
                      <th style={p({ padding: "7px 9px", textAlign: "right",  color: "#bbb", fontWeight: 600, width: "19%" })}>Unit Price</th>
                      <th style={p({ padding: "7px 9px", textAlign: "right",  color: "#fff", fontWeight: 700, width: "19%" })}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item, idx) => (
                      <tr key={item.id} style={p({ background: idx % 2 === 0 ? "#fff" : BGROW, borderBottom: "1px solid #ebebeb" })}>
                        <td style={p({ padding: "6px 9px", verticalAlign: "top" })}>
                          <span style={p({ fontWeight: 700, color: BLACK, display: "block" })}>{item.name}</span>
                          {item.description && <span style={p({ fontSize: "9.5px", color: GRAY, display: "block", marginTop: "1px", lineHeight: 1.45 })}>{renderBold(item.description)}</span>}
                          {item.warranty    && <span style={p({ fontStyle: "italic", fontSize: "9px", color: LGRAY, display: "block", marginTop: "1px" })}>{item.warranty}</span>}
                        </td>
                        <td style={p({ padding: "6px 9px", textAlign: "center", verticalAlign: "top", color: MID, fontWeight: 600 })}>{item.quantity ?? 0}</td>
                        <td style={p({ padding: "6px 9px", textAlign: "right", verticalAlign: "top", color: MID, whiteSpace: "nowrap" })}>
                          {(item.unitPrice ?? 0) === 0 ? <span style={p({ fontWeight: 700, color: BLACK })}>Free</span> : formatCurrency(item.unitPrice ?? 0)}
                        </td>
                        <td style={p({ padding: "6px 9px", textAlign: "right", verticalAlign: "top", fontWeight: 700, color: BLACK, whiteSpace: "nowrap" })}>
                          {(item.total ?? 0) === 0 ? <span style={p({ fontWeight: 700, color: BLACK })}>Free</span> : formatCurrency(item.total ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={p({ display: "flex", justifyContent: "flex-end", background: BG, borderTop: `2px solid ${BORDER}` })}>
                  <table style={p({ borderCollapse: "collapse", fontSize: "9.5px", minWidth: "210px" })}>
                    <tbody>
                      {catDisc > 0 && (
                        <>
                          <tr>
                            <td style={p({ padding: "3px 12px 3px 8px", color: GRAY })}>Sub Total</td>
                            <td style={p({ padding: "3px 9px 3px 0", textAlign: "right", minWidth: "95px", color: MID })}>{formatCurrency(catSub)}</td>
                          </tr>
                          <tr>
                            <td style={p({ padding: "3px 12px 3px 8px", color: GRAY })}>Discount</td>
                            <td style={p({ padding: "3px 9px 3px 0", textAlign: "right", color: RED })}>−{formatCurrency(catDisc)}</td>
                          </tr>
                        </>
                      )}
                      <tr style={p({ borderTop: catDisc > 0 ? `1px solid ${BORDER}` : "none" })}>
                        <td style={p({ padding: "4px 12px 4px 8px", fontWeight: 800, color: BLACK })}>{cat} Total</td>
                        <td style={p({ padding: "4px 9px 4px 0",  fontWeight: 800, color: BLACK, textAlign: "right" })}>{formatCurrency(catTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* ── GRAND TOTAL ── */}
          <div style={p({ display: "flex", justifyContent: "flex-end", margin: "4px 0 14px 0" })}>
            <div style={p({ background: BLACK, borderRadius: "3px", padding: "9px 14px 9px 20px", display: "flex", alignItems: "center", gap: "32px", minWidth: "240px" })}>
              <span style={p({ color: "#999", fontSize: "10.5px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" })}>Grand Total</span>
              <span style={p({ color: "#fff", fontSize: "15px", fontWeight: 900, marginLeft: "auto" })}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* ── NOTE (only if explicitly set) ── */}
          {invoice.note && (
            <div style={p({ borderLeft: `4px solid ${BLACK}`, background: BG, padding: "7px 11px", marginBottom: "12px", borderRadius: "0 3px 3px 0" })}>
              <p style={p({ fontWeight: 700, fontSize: "8px", textTransform: "uppercase", color: GRAY, marginBottom: "3px", letterSpacing: "1.2px" })}>NOTE:</p>
              <p style={p({ fontSize: "9.5px", lineHeight: 1.65, color: MID, margin: 0 })}>{invoice.note}</p>
            </div>
          )}

          {/* ── SIGNATURES ── */}
          <div style={p({ marginBottom: "14px", marginTop: "auto", paddingTop: "16px" })}>
            <div style={p({ display: "flex", justifyContent: "space-between", gap: "14px" })}>
              {[
                { title: "Authorized By", role: "Director", sub: businessName },
                { title: "Prepared By",   role: "Director", sub: businessName },
                { title: "Received By",   role: "Client",   sub: "Customer Acknowledgment" },
              ].map((s, i) => (
                <div key={i} style={p({ flex: "1 1 0", textAlign: "center" })}>
                  <div style={p({ borderBottom: `1.5px solid ${DARK}`, height: "38px", marginBottom: "5px" })} />
                  <p style={p({ fontSize: "9.5px", fontWeight: 700, color: BLACK, margin: "0 0 1px 0" })}>{s.title}</p>
                  <p style={p({ fontSize: "8.5px", fontWeight: 600, color: GRAY,  margin: "0 0 1px 0" })}>{s.role}</p>
                  <p style={p({ fontSize: "8px",   color: LGRAY, margin: 0 })}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={p({ background: BLACK, padding: "7px 18mm", display: "flex", justifyContent: "center", alignItems: "center", gap: "22px", flexWrap: "wrap" })}>
          {businessPhone && <span style={p({ color: "#888", fontSize: "9px" })}>Mobile: <strong style={p({ color: "#ddd" })}>{businessPhone}</strong></span>}
          {businessEmail && <span style={p({ color: "#888", fontSize: "9px" })}>E-Mail: <strong style={p({ color: "#ddd" })}>{businessEmail}</strong></span>}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* PAGE 2 — WARRANTY CONDITIONS                      */}
      {/* ══════════════════════════════════════════════════ */}
      <div style={p({ background: "#fff", width: "210mm", margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", pageBreakBefore: "always" })}>

        <Header />

        {/* ── INVOICE REF BAR ── */}
        <div style={p({ background: BG, borderBottom: `1px solid ${BORDER}`, padding: "5px 18mm", display: "flex", gap: "20px" })}>
          <span style={p({ fontSize: "8.5px", color: GRAY })}>Invoice: <strong style={p({ color: BLACK })}>{invoice.invoiceNumber ?? "—"}</strong></span>
          {invoice.customer?.name && <span style={p({ fontSize: "8.5px", color: GRAY })}>Customer: <strong style={p({ color: BLACK })}>{invoice.customer.name}</strong></span>}
          {invoice.date           && <span style={p({ fontSize: "8.5px", color: GRAY })}>Date: <strong style={p({ color: BLACK })}>{formatDate(invoice.date)}</strong></span>}
        </div>

        {/* ── WARRANTY CONTENT ── */}
        <div style={p({ padding: "10px 18mm 10px 18mm", flex: 1 })}>
          <WSection items={W_EN} title="Warranty Condition" />
          <WSection items={W_SI} title="වගකීම් සහතික කොන්දේසිය" />

        </div>

        {/* ── FOOTER ── */}
        <div style={p({ background: BLACK, padding: "7px 18mm", display: "flex", justifyContent: "center", alignItems: "center", gap: "22px", flexWrap: "wrap" })}>
          {businessPhone && <span style={p({ color: "#888", fontSize: "9px" })}>Mobile: <strong style={p({ color: "#ddd" })}>{businessPhone}</strong></span>}
          {businessEmail && <span style={p({ color: "#888", fontSize: "9px" })}>E-Mail: <strong style={p({ color: "#ddd" })}>{businessEmail}</strong></span>}
        </div>
      </div>

    </div>
  );
}
