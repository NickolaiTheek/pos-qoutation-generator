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
    t: "Duration of Warranty Coverage",
    b: "The warranty period for product is 2 years reduced by 40 working days, 1 year reduced by 20 working days, or 6 months, reduced by 10 working days, depending on the specific terms agreed upon at the time of sale.",
  },
  {
    t: "Source of Warranty",
    b: "The warranty provided is from the manufacturer or their authorized agents.",
  },
  {
    t: "Necessary Documentation for Warranty Claims",
    b: "To submit a warranty claim, the customer must provide the original purchase invoice. Additionally, each item's serial number sticker affixed to the product must be visible and match the one listed on the invoice; any tampering or alteration of the serial number voids the warranty.",
  },
  {
    t: "Conditions Not Covered by the Warranty",
    b: "The warranty does not cover any damage or defects resulting from:",
    bullets: [
      "Physical damage to the product",
      "Water damage or exposure to moisture",
      "Negligence or improper handling by the user",
      "Misuse or use not in accordance with the product's intended purpose",
      "Improper operation or maintenance",
      "Electrical issues such as power surges, fluctuations, or outages",
      "Visible burn marks or other signs of overheating",
      "Damage to pins or connectors",
      "Corrosion, rust, or other forms of material degradation",
      "Scratches or other superficial damage",
      "Lightning strikes, floods, earthquakes, or other natural disasters",
    ],
  },
  {
    t: "Exclusions of Specific Items",
    b: "The warranty explicitly excludes coverage for certain items, including but not limited to printhead units, print cartridges (whether ink or toner), and power adapters. These items are considered consumables or accessories and are not covered by the manufacturer's standard warranty.",
  },
  {
    t: "Void Warranty Due to Sticker Removal",
    b: "If the warranty sticker affixed to the product is found to be tampered with, removed, or otherwise altered, the warranty will be considered void, and no claims will be accepted.",
  },
  {
    t: "Timeframe for Warranty Service",
    b: "Any claim processed under warranty will require a minimum of 21 to 30 working days. This time frame is the minimum required for processing; however, every effort will be made to expedite repairs or replacements and minimize delays.",
  },
  {
    t: "Manufacturer's Discretion on Warranty Resolution",
    b: "The manufacturer or its authorized representative reserves the right to determine the appropriate course of action for any warranty claim. This may include repairing the item, replacing it with the same or a different model with equivalent or similar features, or issuing a refund. If a refund is issued, it will reflect the current market value of the item. Additionally, a usage fee may be deducted based on how long the product was used.",
  },
  {
    t: "Replacement with Higher-Featured Models",
    b: "If the product covered under warranty is not available at the time of the claim, the manufacturer may offer a replacement with a model that has higher or more advanced features. This may require the customer to pay an additional amount to cover the difference in value.",
  },
  {
    t: "Disclaimer on Software Use",
    b: "The company takes no responsibility for any issues arising from the use of pirated or unlicensed software on the product. Customers are strongly encouraged to use genuine, licensed software to ensure proper functionality and avoid potential software-related problems.",
  },
];

const W_SI = [
  {
    t: "වගකීම් ආවරණයේ කාලසීමාව",
    b: "නිෂ්පාදිතය සඳහා වගකීම් කාල සීමාව, විකිණීමේ දී එකඟ වූ නිශ්චිත කොන්දේසි අනුව, වසර 2ක් නම් කාර්ය දින 40කින්, වසර 1ක් නම් කාර්ය දින 20කින් හෝ මාස 6ක් නම් කාර්ය දින 10කින් අඩු කරනු ලැබේ.",
  },
  {
    t: "වගකීම් ප්‍රභවය",
    b: "ලබා දෙන ලද වගකීම නිෂ්පාදකයාගෙන් හෝ ඔවුන්ගේ බලයලත් නියෝජිතයන්ගෙනි.",
  },
  {
    t: "වගකීම් හිමිකම් සඳහා අවශ්‍ය ලිඛිත ලේඛන",
    b: "වගකීම් හිමිකමක් ඉදිරිපත් කිරීමේදී, පාරිභෝගිකයා මූල මිලදී ගැනීමේ ඉන්වොයිසිය ඉදිරිපත් කළ යුතු ය. එමෙන්ම, සෑම භාණ්ඩයකම අනුක්‍රමික අංක ස්ටිකරය ඉන්වොයිසිය සමඟ ගැළපිය යුතු අතර, ඕනෑම වෙනස් කිරීමකින් වගකීම නිෂ්ඵල වේ.",
  },
  {
    t: "වගකීමෙන් ආවරණය නොවන කොන්දේසි",
    b: "පහත හේතූන් නිසා ඇති වූ හානි හෝ දෝෂ වගකීමෙන් ආවරණය නොවේ:",
    bullets: [
      "නිෂ්පාදිතයට ශාරීරිකව සිදු වූ හානි",
      "ජල හානිය හෝ තෙතමනයට නිරාවරණය",
      "නොසැලකිල්ල හෝ නුසුදුසු හැසිරවීම",
      "නිෂ්පාදිතයේ අකේශිත අරමුණට ගැළපෙන ලෙස නොසිත් ශීල් ගැනීම",
      "නුසුදු ශ්‍රීශ් ෝ නිශ්‍චිතාර්ථ හෝ නිසි ලෙස නිම නොකිරීම",
      "බලය කෙටිකිරීම්, ස්ථිතාංශනය හෝ කෙටිකිරීම් ශිත කළ",
      "දෘශ්‍යමාන ගිනිගෙන රැළි සහිත අධික උෂ්ණත්ව සලකුණු",
      "ශ්‍රේෂ්ඨ, සිදුරු හෝ සම්බන්ධකවලට හානි",
      "මල, ක්ෂය හෝ ශ්‍රේෂ්ඨ ශ්‍රේෂ් ශ්‍ශ‍ශ් ශ්‍රේෂ් ශ්‍රේ",
      "සීරීම් හෝ ශ්‍රේෂ් ශ්‍රේෂ් ශ්‍ශ් ශ්‍රේ ශ්‍රේ",
      "ශ්‍රේෂ් ශ්‍රේෂ්, ගංවතුර, භූ කම්පා හෝ ශ්‍රේෂ් ශ්‍රේෂ් ශ්‍රේෂ්",
    ],
  },
  {
    t: "නිශ්චිත භාණ්ඩ සඳහා බැහැර කිරීම්",
    b: "ප්‍රින්ට්හෙඩ් ඒකක, ප්‍රින්ට් කාට්‍රිජ් (ඉංක් හෝ ටෝනර්), සහ පවර් ඇඩැප්ටර් ඇතුළු නිශ්චිත භාණ්ඩ සඳහා වගකීම් ආවරණය ස්පෂ්ටව බැහැර කෙරේ. මෙම භාණ්ඩ consumables හෝ accessories ලෙස සලකනු ලැබෙන අතර නිෂ්පාදකයාගේ සම්මත වගකීමෙන් ආවරණය නොවේ.",
  },
  {
    t: "ස්ටිකරය ඉවත් කිරීමෙන් වගකීම් නිෂ්ඵල වීම",
    b: "නිෂ්පාදිතය මත ඇලවූ වගකීම් ස්ටිකරය සේ නොකළ, ඉවත් කළ, හෝ වෙනස් කළ බව සොයා ගැනුනහොත්, වගකීම නිෂ්ඵල ලෙස සලකනු ලැබෙන අතර කිසිදු හිමිකමක් බාර ගනු නොලැබේ.",
  },
  {
    t: "වගකීම් සේවා සඳහා කාල රාමුව",
    b: "වගකීම් යටතේ ඉදිරිපත් කරන ඕනෑම හිමිකමකට අවම කාර්ය දින 21 සිට 30 දක්වා කාලයක් අවශ්‍ය වේ. මෙය සැකසීමට අවශ්‍ය අවම කාලය වන අතර, අළුත්වැඩියාව හෝ ප්‍රතිස්ථාපනය ශීඝ්‍ර කිරීමට හැකි සෑම උත්සාහයක්ම ගනු ලැබේ.",
  },
  {
    t: "වගකීම් විසඳීමේදී නිෂ්පාදකයාගේ අභිමතය",
    b: "නිෂ්පාදකයා හෝ ඔවුන්ගේ බලයලත් නියෝජිතයා ඕනෑම වගකීම් හිමිකමක් සඳහා සුදුසු ක්‍රියාමාර්ගය — අළුත්වැඩියාව, ප්‍රතිස්ථාපනය, හෝ වර්තමාන වෙළෙඳ වටිනාකමින් මුදල් ආපසු ලබා දීම — තීරණය කිරීමේ අයිතිය රක්ෂා කරගනී. භාවිත කාලය අනුව ශේෂ ප්‍රමාණ අඩු කළ හැකිය.",
  },
  {
    t: "ඉහළ විශේෂාංග සහිත මාදිලි සමඟ ප්‍රතිස්ථාපනය",
    b: "වගකීම් යටතේ ආවරණය කෙරෙන භාණ්ඩය හිමිකම ඉදිරිපත් කිරීමේ අවස්ථාවේ ලබා ගත නොහැකි නම්, නිෂ්පාදකයා ඉහළ හෝ වැඩිදියුණු කළ විශේෂාංග සහිත මාදිලියකින් ප්‍රතිස්ථාපනය ඉදිරිපත් කළ හැකිය. අගයේ වෙනස ආවරණය කිරීමට පාරිභෝගිකයාගෙන් අතිරේක මුදලක් අවශ්‍ය විය හැකිය.",
  },
  {
    t: "මෘදුකාංග භාවිතය පිළිබඳ වියාචනය",
    b: "නිෂ්පාදිතය මත අනවසර හෝ නීති විරෝධී මෘදුකාංග භාවිතය නිසා ඇති වූ ඕනෑම ගැටළුවක් සඳහා සමාගම වගකීමක් නොදරයි. නිසි ක්‍රියාකාරිත්වය සහතික කිරීමට සහ මෘදුකාංග ගැටළු වළකා ගැනීමට පාරිභෝගිකයන් සැබෑ, බලපත්‍රලාභී මෘදුකාංග භාවිතා කරන ලෙස දැඩිව නිර්දේශ කෙරේ.",
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
            {"bullets" in w && w.bullets && (
              <div style={p({ marginTop: "3px", paddingLeft: "4px" })}>
                {(w.bullets as string[]).map((b, j) => (
                  <div key={j} style={p({ display: "flex", gap: "5px", marginBottom: "1px" })}>
                    <span style={p({ fontSize: "9px", color: MID })}>☐</span>
                    <span style={p({ fontSize: "9px", color: MID })}>{b}</span>
                  </div>
                ))}
              </div>
            )}
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

        {/* ── HEADER ── */}
        <div style={p({ background: BLACK, padding: "14px 18mm", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" })}>
          <div style={p({ display: "flex", alignItems: "center", gap: "12px" })}>
            <div style={p({ background: "#fff", borderRadius: "8px", padding: "5px", width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" })}>
              <img src={logo} alt={businessName} style={p({ width: "62px", height: "62px", objectFit: "contain" })} />
            </div>
            <div>
              <p style={p({ color: "#fff", fontSize: "13px", fontWeight: 800, margin: "0 0 3px 0" })}>{businessName}</p>
              {businessPhone && <p style={p({ color: "#aaa", fontSize: "9px", margin: "0 0 2px 0" })}>T: {businessPhone}</p>}
              {businessEmail && <p style={p({ color: "#aaa", fontSize: "9px", margin: 0 })}>E: {businessEmail}</p>}
            </div>
          </div>
          <div style={p({ textAlign: "right" })}>
            <h1 style={p({ color: "#fff", fontSize: "42px", fontWeight: 900, margin: "0 0 4px 0", letterSpacing: "6px", lineHeight: 1 })}>INVOICE</h1>
            <p style={p({ color: "#999", fontSize: "10px", margin: 0, letterSpacing: "0.5px" })}>{invoice.invoiceNumber ?? "—"}</p>
          </div>
        </div>

        {/* ── ACCENT LINE ── */}
        <div style={p({ height: "3px", background: `linear-gradient(90deg, ${BLACK} 0%, #555 50%, ${BLACK} 100%)` })} />

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
      <div style={p({ background: "#fff", width: "210mm", margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", pageBreakBefore: "always", minHeight: "297mm" })}>

        {/* ── WARRANTY HEADER ── */}
        <div style={p({ background: BLACK, padding: "10px 18mm", display: "flex", justifyContent: "space-between", alignItems: "center" })}>
          <div style={p({ display: "flex", alignItems: "center", gap: "10px" })}>
            <div style={p({ background: "#fff", borderRadius: "6px", padding: "4px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" })}>
              <img src={logo} alt={businessName} style={p({ width: "42px", height: "42px", objectFit: "contain" })} />
            </div>
            <div>
              <p style={p({ color: "#fff", fontSize: "11px", fontWeight: 800, margin: "0 0 1px 0" })}>{businessName}</p>
              {businessPhone && <p style={p({ color: "#aaa", fontSize: "8.5px", margin: 0 })}>T: {businessPhone}</p>}
            </div>
          </div>
          <div style={p({ textAlign: "right" })}>
            <p style={p({ color: "#fff", fontSize: "17px", fontWeight: 900, letterSpacing: "3px", margin: "0 0 1px 0" })}>WARRANTY</p>
            <p style={p({ color: "#999", fontSize: "8.5px", margin: 0, letterSpacing: "0.5px" })}>CONDITIONS</p>
          </div>
        </div>

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

          {/* Client sign strip */}
          <div style={p({ marginTop: "8px", borderTop: `1px solid ${BORDER}`, paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "14px" })}>
            <p style={p({ fontSize: "8px", color: GRAY, flex: 1, lineHeight: 1.55, margin: 0 })}>
              By accepting this invoice, the customer acknowledges having read, understood, and agreed to all warranty conditions stated above.<br />
              <span>මෙම ඉන්වොයිසිය භාර ගැනීමෙන් ඉහත සඳහන් සියලු වගකීම් කොන්දේසිවලට සම්මත වූ බව පාරිභෝගිකයා තහවුරු කරයි.</span>
            </p>
            <div style={p({ textAlign: "center", minWidth: "110px" })}>
              <div style={p({ borderBottom: `1.5px solid ${DARK}`, height: "28px", marginBottom: "4px" })} />
              <p style={p({ fontSize: "8px", color: GRAY, margin: 0 })}>Client Signature / Date</p>
            </div>
          </div>
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
