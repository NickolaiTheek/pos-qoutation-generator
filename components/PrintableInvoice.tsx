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
}

export default function PrintableInvoice({
  invoice,
  businessName = "Zero Pos",
  businessAddress,
  businessPhone,
  businessEmail,
}: PrintableInvoiceProps) {
  const subtotal = invoice.subtotal;
  const discountTotal = invoice.discountTotal;
  const grandTotal = invoice.grandTotal;

  return (
    <div
      id="printable-invoice"
      className="bg-white w-[210mm] min-h-[297mm] mx-auto px-8 py-8 text-sm font-sans"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">ZP</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{businessName}</h2>
            <p className="text-xs text-gray-500">POS System Solutions</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-blue-700 tracking-wide">INVOICE</h1>
          <p className="text-sm text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              invoice.status === "Paid"
                ? "bg-green-100 text-green-700"
                : invoice.status === "Unpaid"
                ? "bg-yellow-100 text-yellow-700"
                : invoice.status === "Cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-blue-600 mb-6" />

      {/* Info Row */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Bill To</p>
          <p className="font-semibold text-gray-900">{invoice.customer?.name}</p>
          {invoice.customer?.businessName && (
            <p className="text-gray-600">{invoice.customer.businessName}</p>
          )}
          <p className="text-gray-600">{invoice.customer?.mobile}</p>
          {invoice.customer?.email && <p className="text-gray-600">{invoice.customer.email}</p>}
          {invoice.customer?.address && <p className="text-gray-600 text-xs mt-1">{invoice.customer.address}</p>}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Details</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-800">{formatDate(invoice.date)}</span>
          </div>
          {invoice.quotationId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">From Quotation</span>
              <span className="font-medium text-gray-800 text-xs">{invoice.quotationId}</span>
            </div>
          )}
          {businessPhone && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-gray-800">{businessPhone}</span>
            </div>
          )}
          {businessEmail && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{businessEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="py-2.5 px-3 text-left font-semibold text-xs uppercase">#</th>
            <th className="py-2.5 px-3 text-left font-semibold text-xs uppercase">Item</th>
            <th className="py-2.5 px-3 text-center font-semibold text-xs uppercase w-14">Qty</th>
            <th className="py-2.5 px-3 text-right font-semibold text-xs uppercase w-28">Unit Price</th>
            {discountTotal > 0 && (
              <th className="py-2.5 px-3 text-right font-semibold text-xs uppercase w-24">Discount</th>
            )}
            <th className="py-2.5 px-3 text-right font-semibold text-xs uppercase w-28">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, i) => (
            <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="py-3 px-3 text-gray-500">{i + 1}</td>
              <td className="py-3 px-3">
                <p className="font-medium text-gray-800">{item.name}</p>
                {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                {item.warranty && <p className="text-xs text-blue-600 mt-0.5">{item.warranty}</p>}
              </td>
              <td className="py-3 px-3 text-center text-gray-700">{item.quantity}</td>
              <td className="py-3 px-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
              {discountTotal > 0 && (
                <td className="py-3 px-3 text-right text-gray-500">
                  {item.discount > 0 ? formatCurrency(item.discount) : "—"}
                </td>
              )}
              <td className="py-3 px-3 text-right font-semibold text-gray-800">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-1.5 text-sm text-gray-600 border-b border-gray-100">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between py-1.5 text-sm text-red-500 border-b border-gray-100">
              <span>Discount</span>
              <span>- {formatCurrency(discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between py-2.5 text-base font-bold text-white bg-blue-600 rounded-lg px-3 mt-2">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Note</p>
        <p className="text-sm text-gray-700 leading-relaxed">{invoice.note || DEFAULT_NOTE}</p>
      </div>

      {/* Footer */}
      <div className="h-px bg-gray-200 mt-8 mb-4" />
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{businessName} — POS System Solutions</span>
        {businessPhone && <span>{businessPhone}</span>}
        <span>Thank you for your business!</span>
      </div>
    </div>
  );
}
