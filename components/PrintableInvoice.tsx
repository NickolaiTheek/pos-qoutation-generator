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
  businessLogoUrl?: string;
}

const p = (s: React.CSSProperties): React.CSSProperties => s;

// ── Black & White Premium Palette ────────────────────────────
const BLACK   = "#0a0a0a";
const DARK    = "#1a1a1a";
const MID     = "#2e2e2e";
const GRAY    = "#555555";
const LGRAY   = "#888888";
const BORDER  = "#c8c8c8";
const BGLIGHT = "#f7f7f7";
const BGROW   = "#fafafa";
const PAID_GREEN    = "#16a34a";
const UNPAID_ORANGE = "#d97706";
const CANCEL_RED    = "#dc2626";

function statusBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: "2px",
    fontWeight: 700,
    fontSize: "9px",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  };
  if (status === "Paid")      return { ...base, background: "#f0fdf4", color: PAID_GREEN,    border: `1.5px solid ${PAID_GREEN}` };
  if (status === "Cancelled") return { ...base, background: "#fef2f2", color: CANCEL_RED,    border: `1.5px solid ${CANCEL_RED}` };
  return                             { ...base, background: "#fffbeb", color: UNPAID_ORANGE, border: `1.5px solid ${UNPAID_ORANGE}` };
}

// ── Warranty Data (English + Sinhala) ────────────────────────
const WARRANTY = [
  {
    en_t: "Duration of Warranty Coverage",
    en_b: "The warranty period is 2 years reduced by 40 working days, 1 year reduced by 20 working days, or 6 months reduced by 10 working days, depending on the specific terms agreed upon at the time of sale.",
    si_t: "වගකීම් ආවරණයේ කාලසීමාව",
    si_b: "නිෂ්පාදිතය සඳහා වගකීම් කාලය, විකිණීමේදී එකඟ වූ කොන්දේසි අනුව, වසර 2ක් නම් කාර්ය දින 40කින්, වසර 1ක් නම් 20කින්, හෝ මාස 6ක් නම් 10කින් අඩු කරනු ලැබේ.",
  },
  {
    en_t: "Source of Warranty",
    en_b: "The warranty provided is from the manufacturer or their authorized agents.",
    si_t: "වගකීම් ප්‍රභවය",
    si_b: "ලබා දෙන ලද වගකීම නිෂ්පාදකයාගෙන් හෝ ඔවුන්ගේ බලයලත් නියෝජිතයන්ගෙනි.",
  },
  {
    en_t: "Necessary Documentation for Warranty Claims",
    en_b: "To submit a warranty claim, the customer must provide the original purchase invoice. Each item's serial number sticker must be visible and match the one on the invoice; any tampering or alteration of the serial number voids the warranty.",
    si_t: "වගකීම් හිමිකම් සඳහා අවශ්‍ය ලේඛන",
    si_b: "වගකීම් හිමිකමක් ඉදිරිපත් කිරීමේදී, පාරිභෝගිකයා මූල ඉන්වොයිසිය ඉදිරිපත් කළ යුතු ය. අනු ශ්‍රේණි ස්ටිකරය ඉන්වොයිසිය සමඟ ගැළපිය යුතු අතර, ඕනෑම වෙනස් කිරීමකින් වගකීම නිෂ්ඵල වේ.",
  },
  {
    en_t: "Conditions Not Covered by the Warranty",
    en_b: "The warranty does not cover damage from: Physical damage · Water or moisture exposure · Negligence or improper handling · Misuse or unintended use · Improper operation or maintenance · Electrical surges or outages · Overheating signs · Damage to pins or connectors · Corrosion or rust · Scratches · Lightning, floods, or earthquakes.",
    si_t: "වගකීමෙන් ආවරණය නොවන කොන්දේසි",
    si_b: "පහත හේතූන් නිසා ඇති වූ හානි ආවරණය නොවේ: ශාරීරික හානි · ජල හානිය · නොසැලකිල්ල · අනිසි භාවිතය · නුසුදුසු ක්‍රියාකාරිත්වය · විදුලි උඩිත්තු · අධික උෂ්ණය · ශ්‍රේෂ්ඨ හා සිදුරු හානි · මල, ක්ෂය · සීරීම් · ගිගිරිලි, ගංවතුර, භූ කම්පා.",
  },
  {
    en_t: "Exclusions of Specific Items",
    en_b: "The warranty explicitly excludes printhead units, print cartridges (ink or toner), and power adapters. These are considered consumables or accessories and are not covered by the manufacturer's standard warranty.",
    si_t: "නිශ්චිත භාණ්ඩ සඳහා බැහැර කිරීම්",
    si_b: "ප්‍රින්ට්හෙඩ්, ප්‍රින්ට් කාට්‍රිජ් සහ පවර් ඇඩැප්ටර් සඳහා වගකීම් ආවරණය ස්පෂ්ටව බැහැර කෙරේ. මෙම භාණ්ඩ consumables ලෙස සලකනු ලැබෙන අතර නිෂ්පාදකයාගේ සම්මත වගකීමෙන් ආවරණය නොවේ.",
  },
  {
    en_t: "Void Warranty Due to Sticker Removal",
    en_b: "If the warranty sticker is found to be tampered with, removed, or otherwise altered, the warranty will be considered void and no claims will be accepted.",
    si_t: "ස්ටිකරය ඉවත් කිරීමෙන් වගකීම් නිෂ්ඵල වීම",
    si_b: "වගකීම් ස්ටිකරය සේ නොකළ, ඉවත් කළ, හෝ වෙනස් කළ බව සොයා ගැනුනහොත්, වගකීම නිෂ්ඵල ලෙස සලකනු ලැබෙන අතර කිසිදු හිමිකමක් බාර ගනු නොලැබේ.",
  },
  {
    en_t: "Timeframe for Warranty Service",
    en_b: "Any claim processed under warranty will require a minimum of 21 to 30 working days. Every effort will be made to expedite repairs or replacements and minimize delays.",
    si_t: "වගකීම් සේවා සඳහා කාල රාමුව",
    si_b: "වගකීම් යටතේ ඉදිරිපත් කරන ඕනෑම හිමිකමකට අවම කාර්ය දින 21–30ක් අවශ්‍ය වේ. ශීඝ්‍ර අළුත්වැඩියාව සහ ප්‍රතිස්ථාපනය සඳහා හැකි සෑම උත්සාහයක්ම ගනු ලැබේ.",
  },
  {
    en_t: "Manufacturer's Discretion on Warranty Resolution",
    en_b: "The manufacturer reserves the right to determine the appropriate course of action: repairing, replacing with the same or equivalent model, or issuing a refund at current market value. A usage fee may be deducted based on how long the product was used.",
    si_t: "වගකීම් විසඳීමේදී නිෂ්පාදකයාගේ අභිමතය",
    si_b: "නිෂ්පාදකයා සුදුසු ක්‍රියාමාර්ගය — අළුත්වැඩියාව, ප්‍රතිස්ථාපනය, හෝ වර්තමාන වෙළෙඳ වටිනාකමින් මුදල් ආපසු ලබා දීම — තීරණය කිරීමේ අයිතිය රක්ෂා කරගනී. භාවිත කාලය අනුව ශේෂ ප්‍රමාණ අඩු කළ හැකිය.",
  },
  {
    en_t: "Replacement with Higher-Featured Models",
    en_b: "If the warranted product is unavailable at time of claim, the manufacturer may offer a replacement with higher or more advanced features. This may require the customer to pay an additional amount to cover the difference in value.",
    si_t: "ඉහළ විශේෂාංග සහිත මාදිලි සමඟ ප්‍රතිස්ථාපනය",
    si_b: "වගකීම් යටතේ ආවරණය කෙරෙන භාණ්ඩය ලබා ගත නොහැකි නම්, ඉහළ විශේෂාංග සහිත මාදිලියකින් ප්‍රතිස්ථාපනය ඉදිරිපත් කළ හැකිය. අගයේ වෙනස ආවරණය කිරීමට අතිරේක මුදලක් අවශ්‍ය විය හැකිය.",
  },
  {
    en_t: "Disclaimer on Software Use",
    en_b: "The company takes no responsibility for issues arising from the use of pirated or unlicensed software. Customers are strongly encouraged to use genuine, licensed software to ensure proper functionality and avoid software-related problems.",
    si_t: "මෘදුකාංග භාවිතය පිළිබඳ වියාචනය",
    si_b: "අනවසර හෝ නීති විරෝධී මෘදුකාංග භාවිතය නිසා ඇති වූ ගැටළු සඳහා සමාගම වගකීමක් නොදරයි. නිසි ක්‍රියාකාරිත්වය සඳහා සැබෑ, බලපත්‍රලාභී මෘදුකාංග භාවිතා කරන ලෙස නිර්දේශ කෙරේ.",
  },
];

// ── Shared Header/Footer sub-components ──────────────────────
function PageHeader({
  businessName,
  businessPhone,
  businessEmail,
  businessWeb,
  logoUrl,
  invoiceNumber,
  label = "INVOICE",
}: {
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWeb?: string;
  logoUrl?: string;
  invoiceNumber?: string;
  label?: string;
}) {
  return (
    <div style={p({ background: BLACK, padding: "16px 20mm", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" })}>
      {/* Left: Logo + info */}
      <div style={p({ display: "flex", alignItems: "center", gap: "13px" })}>
        <div style={p({ background: "#ffffff", borderRadius: "9px", padding: "5px", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.35)" })}>
          <img src={logoUrl || "/logo.png"} alt={businessName} style={p({ width: "70px", height: "70px", objectFit: "contain", display: "block" })} />
        </div>
        <div>
          <p style={p({ color: "#ffffff", fontSize: "13px", margin: "0 0 4px 0", fontWeight: 800, letterSpacing: "0.3px" })}>{businessName}</p>
          {businessPhone && <p style={p({ color: "#aaaaaa", fontSize: "9.5px", margin: "0 0 2px 0" })}>T: {businessPhone}</p>}
          {businessEmail && <p style={p({ color: "#aaaaaa", fontSize: "9.5px", margin: "0 0 2px 0" })}>E: {businessEmail}</p>}
          {businessWeb   && <p style={p({ color: "#aaaaaa", fontSize: "9.5px", margin: 0 })}>W: {businessWeb}</p>}
        </div>
      </div>
      {/* Right: Title */}
      <div style={p({ textAlign: "right", flexShrink: 0 })}>
        <h1 style={p({ color: "#ffffff", fontSize: "40px", fontWeight: 900, margin: "0 0 5px 0", letterSpacing: "5px", textTransform: "uppercase", lineHeight: 1 })}>{label}</h1>
        {invoiceNumber && <p style={p({ color: "#aaaaaa", fontSize: "10.5px", margin: 0, letterSpacing: "0.5px" })}>{invoiceNumber}</p>}
      </div>
    </div>
  );
}

function PageFooter({
  businessPhone,
  businessEmail,
  businessWeb,
  businessName,
}: {
  businessPhone?: string;
  businessEmail?: string;
  businessWeb?: string;
  businessName: string;
}) {
  return (
    <div style={p({ background: BLACK, padding: "8px 20mm", display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", flexWrap: "wrap" })}>
      {businessPhone && <span style={p({ color: "#888888", fontSize: "9.5px" })}>Mobile: <strong style={p({ color: "#dddddd" })}>{businessPhone}</strong></span>}
      {businessEmail && <span style={p({ color: "#888888", fontSize: "9.5px" })}>E-Mail: <strong style={p({ color: "#dddddd" })}>{businessEmail}</strong></span>}
      {businessWeb   && <span style={p({ color: "#888888", fontSize: "9.5px" })}>Web: <strong style={p({ color: "#dddddd" })}>{businessWeb}</strong></span>}
      {!businessPhone && !businessEmail && !businessWeb && (
        <span style={p({ color: "#888888", fontSize: "9.5px" })}>{businessName} — Thank you for your business!</span>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function PrintableInvoice({
  invoice,
  businessName = "Zero Pos Solutions",
  businessAddress,
  businessPhone,
  businessEmail,
  businessWeb,
  businessLogoUrl,
}: PrintableInvoiceProps) {
  const items = invoice.items ?? [];

  // Group items by category
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

  const sharedHeaderProps = {
    businessName,
    businessPhone,
    businessEmail,
    businessWeb,
    logoUrl: businessLogoUrl,
  };

  const sharedFooterProps = {
    businessPhone,
    businessEmail,
    businessWeb,
    businessName,
  };

  return (
    <div
      id="printable-invoice"
      style={p({ background: "#f0f0f0", fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif", fontSize: "11px", color: BLACK })}
    >

      {/* ════════════════════════════════════════════════════ */}
      {/* PAGE 1 — INVOICE                                    */}
      {/* ════════════════════════════════════════════════════ */}
      <div style={p({
        background: "#ffffff",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        pageBreakAfter: "always",
      })}>

        {/* PAID watermark */}
        {isPaid && (
          <div style={p({ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, -50%) rotate(-28deg)", fontSize: "80px", fontWeight: 900, color: "#000000", opacity: 0.04, letterSpacing: "8px", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", zIndex: 0 })}>
            PAID
          </div>
        )}

        {/* HEADER */}
        <PageHeader {...sharedHeaderProps} invoiceNumber={invoice.invoiceNumber ?? "—"} />

        {/* HEADER BOTTOM BORDER */}
        <div style={p({ background: BLACK, height: "3px" })} />

        {/* BILL TO + INVOICE META */}
        <div style={p({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20mm 14px 20mm", gap: "20px", background: BGLIGHT, borderBottom: `1px solid ${BORDER}`, position: "relative", zIndex: 1 })}>
          {/* Bill To */}
          <div style={p({ flex: "1 1 0", minWidth: 0 })}>
            <p style={p({ fontSize: "8.5px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: GRAY, margin: "0 0 6px 0", borderBottom: `1.5px solid ${DARK}`, paddingBottom: "3px", display: "inline-block" })}>
              Bill To
            </p>
            <p style={p({ fontWeight: 800, fontSize: "13px", margin: "0 0 2px 0", color: BLACK })}>
              {invoice.customer?.name ?? "—"}
            </p>
            {invoice.customer?.businessName && <p style={p({ fontSize: "10.5px", color: MID,  margin: "0 0 1px 0" })}>{invoice.customer.businessName}</p>}
            {invoice.customer?.mobile       && <p style={p({ fontSize: "10px",   color: GRAY, margin: "0 0 1px 0" })}>T: {invoice.customer.mobile}</p>}
            {invoice.customer?.email        && <p style={p({ fontSize: "10px",   color: GRAY, margin: "0 0 1px 0" })}>{invoice.customer.email}</p>}
            {invoice.customer?.address      && <p style={p({ fontSize: "10px",   color: LGRAY, margin: 0 })}>{invoice.customer.address}</p>}
          </div>

          {/* Invoice Meta box */}
          <div style={p({ flex: "0 0 210px", background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "11px 13px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" })}>
            <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" })}>
              <tbody>
                <tr style={p({ borderBottom: `1px solid #eeeeee` })}>
                  <td style={p({ padding: "4px 0", color: GRAY, fontWeight: 600 })}>Invoice No.</td>
                  <td style={p({ padding: "4px 0", textAlign: "right", fontWeight: 800, color: BLACK })}>{invoice.invoiceNumber ?? "—"}</td>
                </tr>
                <tr style={p({ borderBottom: `1px solid #eeeeee` })}>
                  <td style={p({ padding: "4px 0", color: GRAY, fontWeight: 600 })}>Date</td>
                  <td style={p({ padding: "4px 0", textAlign: "right", color: MID })}>{invoice.date ? formatDate(invoice.date) : "—"}</td>
                </tr>
                {invoice.quotationId && (
                  <tr style={p({ borderBottom: `1px solid #eeeeee` })}>
                    <td style={p({ padding: "4px 0", color: GRAY, fontWeight: 600 })}>Ref. Quotation</td>
                    <td style={p({ padding: "4px 0", textAlign: "right", color: MID, fontSize: "9.5px", wordBreak: "break-all" })}>{invoice.quotationId}</td>
                  </tr>
                )}
                <tr>
                  <td style={p({ padding: "4px 0", color: GRAY, fontWeight: 600 })}>Status</td>
                  <td style={p({ padding: "4px 0", textAlign: "right" })}>
                    <span style={statusBadgeStyle(invoice.status)}>{invoice.status}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ITEMS */}
        <div style={p({ padding: "12px 20mm 0 20mm", flex: 1, position: "relative", zIndex: 1 })}>
          {categoryOrder.map((cat) => {
            const catItems = grouped[cat];
            const catSubtotal = catItems.reduce((s, i) => s + (i.quantity ?? 0) * (i.unitPrice ?? 0), 0);
            const catDiscount = catItems.reduce((s, i) => s + (i.discount ?? 0), 0);
            const catTotal    = catSubtotal - catDiscount;

            return (
              <div key={cat} style={p({ marginBottom: "14px" })}>
                <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" })}>
                  <thead>
                    <tr style={p({ background: DARK })}>
                      <th style={p({ padding: "8px 10px", textAlign: "left",   color: "#ffffff", fontWeight: 700, fontSize: "10.5px", width: "52%" })}>{cat}</th>
                      <th style={p({ padding: "8px 10px", textAlign: "center", color: "#bbbbbb", fontWeight: 600, fontSize: "10px",   width: "10%" })}>Qty</th>
                      <th style={p({ padding: "8px 10px", textAlign: "right",  color: "#bbbbbb", fontWeight: 600, fontSize: "10px",   width: "19%" })}>Unit Price</th>
                      <th style={p({ padding: "8px 10px", textAlign: "right",  color: "#ffffff", fontWeight: 700, fontSize: "10px",   width: "19%" })}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map((item, idx) => (
                      <tr key={item.id} style={p({ background: idx % 2 === 0 ? "#ffffff" : BGROW, borderBottom: `1px solid #e8e8e8` })}>
                        <td style={p({ padding: "7px 10px", verticalAlign: "top" })}>
                          <span style={p({ fontWeight: 700, color: BLACK, display: "block" })}>{item.name}</span>
                          {item.description && (
                            <span style={p({ fontWeight: 400, fontSize: "10px", color: GRAY, display: "block", marginTop: "1px", lineHeight: 1.5 })}>
                              {renderBold(item.description)}
                            </span>
                          )}
                          {item.warranty && (
                            <span style={p({ fontStyle: "italic", fontSize: "9.5px", color: LGRAY, display: "block", marginTop: "1px" })}>
                              {item.warranty}
                            </span>
                          )}
                        </td>
                        <td style={p({ padding: "7px 10px", textAlign: "center", verticalAlign: "top", color: MID, fontWeight: 600 })}>{item.quantity ?? 0}</td>
                        <td style={p({ padding: "7px 10px", textAlign: "right", verticalAlign: "top", color: MID, whiteSpace: "nowrap" })}>
                          {(item.unitPrice ?? 0) === 0
                            ? <span style={p({ color: BLACK, fontWeight: 700, fontSize: "10px" })}>Free</span>
                            : formatCurrency(item.unitPrice ?? 0)}
                        </td>
                        <td style={p({ padding: "7px 10px", textAlign: "right", verticalAlign: "top", fontWeight: 700, color: BLACK, whiteSpace: "nowrap" })}>
                          {(item.total ?? 0) === 0
                            ? <span style={p({ color: BLACK, fontWeight: 700, fontSize: "10px" })}>Free</span>
                            : formatCurrency(item.total ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Category subtotal */}
                <div style={p({ display: "flex", justifyContent: "flex-end", background: BGLIGHT, borderTop: `2px solid ${BORDER}` })}>
                  <table style={p({ borderCollapse: "collapse", fontSize: "10px", minWidth: "230px" })}>
                    <tbody>
                      {catDiscount > 0 && (
                        <>
                          <tr>
                            <td style={p({ padding: "3px 14px 3px 10px", color: GRAY })}>Sub Total</td>
                            <td style={p({ padding: "3px 10px 3px 0", textAlign: "right", minWidth: "100px", color: MID })}>{formatCurrency(catSubtotal)}</td>
                          </tr>
                          <tr>
                            <td style={p({ padding: "3px 14px 3px 10px", color: GRAY })}>Discount</td>
                            <td style={p({ padding: "3px 10px 3px 0", textAlign: "right", color: CANCEL_RED })}>−{formatCurrency(catDiscount)}</td>
                          </tr>
                        </>
                      )}
                      <tr style={p({ borderTop: catDiscount > 0 ? `1px solid ${BORDER}` : "none" })}>
                        <td style={p({ padding: "5px 14px 5px 10px", fontWeight: 800, color: BLACK })}>{cat} Total</td>
                        <td style={p({ padding: "5px 10px 5px 0", textAlign: "right", fontWeight: 800, color: BLACK })}>{formatCurrency(catTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* GRAND TOTAL */}
          <div style={p({ display: "flex", justifyContent: "flex-end", margin: "4px 0 16px 0" })}>
            <div style={p({ background: BLACK, borderRadius: "3px", padding: "10px 16px 10px 22px", display: "flex", alignItems: "center", gap: "36px", minWidth: "255px" })}>
              <span style={p({ color: "#aaaaaa", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" })}>Grand Total</span>
              <span style={p({ color: "#ffffff", fontSize: "15px", fontWeight: 900, marginLeft: "auto" })}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* NOTE */}
          {(invoice.note || DEFAULT_NOTE) && (
            <div style={p({ borderLeft: `4px solid ${BLACK}`, background: BGLIGHT, padding: "8px 12px", marginBottom: "16px", borderRadius: "0 3px 3px 0" })}>
              <p style={p({ fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase", color: GRAY, marginBottom: "3px", letterSpacing: "1.2px" })}>NOTE:</p>
              <p style={p({ fontSize: "9.5px", lineHeight: 1.7, color: MID, margin: 0 })}>{invoice.note || DEFAULT_NOTE}</p>
            </div>
          )}

          {/* SIGNATURES */}
          <div style={p({ marginBottom: "20px", marginTop: "10px" })}>
            <div style={p({ display: "flex", justifyContent: "space-between", gap: "16px" })}>
              {[
                { role: "Director", title: "Authorized By", subtitle: businessName },
                { role: "Director", title: "Prepared By",   subtitle: businessName },
                { role: "Client",   title: "Received By",   subtitle: "Customer Acknowledgment" },
              ].map((sig, i) => (
                <div key={i} style={p({ flex: "1 1 0", textAlign: "center" })}>
                  <div style={p({ borderBottom: `1.5px solid ${DARK}`, height: "42px", marginBottom: "6px" })} />
                  <p style={p({ fontSize: "10px", fontWeight: 700, color: BLACK, margin: "0 0 1px 0" })}>{sig.title}</p>
                  <p style={p({ fontSize: "9px",  fontWeight: 600, color: GRAY,  margin: "0 0 1px 0" })}>{sig.role}</p>
                  <p style={p({ fontSize: "8.5px", color: LGRAY, margin: 0 })}>{sig.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <PageFooter {...sharedFooterProps} />
      </div>

      {/* ════════════════════════════════════════════════════ */}
      {/* PAGE 2 — WARRANTY CONDITIONS                        */}
      {/* ════════════════════════════════════════════════════ */}
      <div style={p({
        background: "#ffffff",
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        pageBreakBefore: "always",
      })}>

        {/* COMPACT HEADER */}
        <div style={p({ background: BLACK, padding: "12px 20mm", display: "flex", justifyContent: "space-between", alignItems: "center" })}>
          <div style={p({ display: "flex", alignItems: "center", gap: "10px" })}>
            <div style={p({ background: "#ffffff", borderRadius: "7px", padding: "4px", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 })}>
              <img src={businessLogoUrl || "/logo.png"} alt={businessName} style={p({ width: "44px", height: "44px", objectFit: "contain" })} />
            </div>
            <div>
              <p style={p({ color: "#ffffff", fontSize: "11px", fontWeight: 800, margin: "0 0 2px 0" })}>{businessName}</p>
              {businessPhone && <p style={p({ color: "#aaaaaa", fontSize: "8.5px", margin: 0 })}>T: {businessPhone}</p>}
            </div>
          </div>
          <div style={p({ textAlign: "right" })}>
            <p style={p({ color: "#ffffff", fontSize: "16px", fontWeight: 900, letterSpacing: "3px", margin: "0 0 2px 0" })}>WARRANTY</p>
            <p style={p({ color: "#aaaaaa", fontSize: "8.5px", margin: 0, letterSpacing: "0.3px" })}>CONDITIONS</p>
          </div>
        </div>

        {/* INVOICE REFERENCE BAR */}
        <div style={p({ background: BGLIGHT, borderBottom: `1px solid ${BORDER}`, padding: "6px 20mm", display: "flex", gap: "24px", alignItems: "center" })}>
          <span style={p({ fontSize: "9px", color: GRAY })}>Invoice: <strong style={p({ color: BLACK })}>{invoice.invoiceNumber ?? "—"}</strong></span>
          {invoice.customer?.name && <span style={p({ fontSize: "9px", color: GRAY })}>Customer: <strong style={p({ color: BLACK })}>{invoice.customer.name}</strong></span>}
          {invoice.date && <span style={p({ fontSize: "9px", color: GRAY })}>Date: <strong style={p({ color: BLACK })}>{formatDate(invoice.date)}</strong></span>}
        </div>

        {/* WARRANTY TITLE */}
        <div style={p({ padding: "10px 20mm 6px 20mm", borderBottom: `2px solid ${DARK}` })}>
          <p style={p({ fontSize: "12px", fontWeight: 900, color: BLACK, margin: "0 0 2px 0", letterSpacing: "0.5px", textTransform: "uppercase" })}>
            Warranty Conditions
          </p>
          <p style={p({ fontSize: "11px", fontWeight: 700, color: MID, margin: 0 })}>
            වගකීම් සහතික කොන්දේසිය
          </p>
        </div>

        {/* WARRANTY TABLE — English | Sinhala side by side */}
        <div style={p({ padding: "8px 20mm 12px 20mm", flex: 1 })}>
          <table style={p({ width: "100%", borderCollapse: "collapse", fontSize: "9px", lineHeight: 1.55 })}>
            {/* Column headers */}
            <thead>
              <tr style={p({ background: DARK })}>
                <th style={p({ width: "22px", padding: "5px 6px", color: "#aaaaaa", fontWeight: 700, textAlign: "center", verticalAlign: "middle", borderRight: `1px solid #444` })}>#</th>
                <th style={p({ width: "50%", padding: "5px 9px", color: "#ffffff", fontWeight: 700, textAlign: "left", verticalAlign: "middle", borderRight: `1px solid #444` })}>English</th>
                <th style={p({ padding: "5px 9px", color: "#ffffff", fontWeight: 700, textAlign: "left", verticalAlign: "middle" })}>සිංහල</th>
              </tr>
            </thead>
            <tbody>
              {WARRANTY.map((w, i) => (
                <tr key={i} style={p({ background: i % 2 === 0 ? "#ffffff" : BGROW, borderBottom: `1px solid #e4e4e4` })}>
                  {/* Number */}
                  <td style={p({ padding: "6px 6px", textAlign: "center", verticalAlign: "top", fontWeight: 800, color: BLACK, borderRight: `1px solid ${BORDER}` })}>
                    {i + 1}
                  </td>
                  {/* English */}
                  <td style={p({ padding: "6px 9px", verticalAlign: "top", borderRight: `1px solid ${BORDER}` })}>
                    <span style={p({ fontWeight: 700, color: BLACK, display: "block", marginBottom: "2px", fontSize: "8.5px" })}>{w.en_t}</span>
                    <span style={p({ color: MID, fontSize: "8.5px" })}>{w.en_b}</span>
                  </td>
                  {/* Sinhala */}
                  <td style={p({ padding: "6px 9px", verticalAlign: "top" })}>
                    <span style={p({ fontWeight: 700, color: BLACK, display: "block", marginBottom: "2px", fontSize: "8.5px" })}>{w.si_t}</span>
                    <span style={p({ color: MID, fontSize: "8.5px" })}>{w.si_b}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Acceptance signature strip at bottom of page 2 */}
          <div style={p({ marginTop: "14px", borderTop: `1px solid ${BORDER}`, paddingTop: "10px", display: "flex", justifyContent: "space-between", gap: "16px" })}>
            <p style={p({ fontSize: "8.5px", color: GRAY, flex: 1, lineHeight: 1.6, margin: 0 })}>
              By accepting this invoice, the customer acknowledges having read, understood, and agreed to all warranty conditions stated above.<br />
              <span style={p({ fontSize: "8.5px" })}>මෙම ඉන්වොයිසිය භාර ගැනීමෙන් ඉහත සඳහන් සියලු වගකීම් කොන්දේසිවලට සහ ප්‍රකාශනවලට සම්මත වූ බව පාරිභෝගිකයා තහවුරු කරයි.</span>
            </p>
            <div style={p({ textAlign: "center", minWidth: "120px" })}>
              <div style={p({ borderBottom: `1.5px solid ${DARK}`, height: "30px", marginBottom: "4px" })} />
              <p style={p({ fontSize: "8.5px", color: GRAY, margin: 0 })}>Client Signature / Date</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <PageFooter {...sharedFooterProps} />
      </div>

    </div>
  );
}
