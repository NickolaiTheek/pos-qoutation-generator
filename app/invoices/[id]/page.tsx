"use client";

import PDFDownloadButton from "@/components/PDFDownloadButton";
import PrintableInvoice from "@/components/PrintableInvoice";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types";
import { ArrowLeft, BadgeCheck, Pencil, Printer, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Record Payment dialog
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payType, setPayType] = useState<"advance" | "full">("advance");
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const fetchData = () => {
    Promise.all([
      fetch("/api/invoices/" + id).then(r => r.json()),
      fetch("/api/settings").then(r => r.json()),
    ]).then(([inv, s]) => {
      if (inv?.error) {
        console.error("Invoice API error:", inv.error);
        setInvoice(null);
      } else {
        setInvoice(inv);
      }
      setSettings(s?.error ? null : s);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load invoice:", err);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!invoice) return (
    <div className="p-8 text-center">
      <p className="text-gray-500 text-lg font-medium">Invoice not found</p>
      <p className="text-gray-400 text-sm mt-1">This invoice may have failed to save. Please try converting the quotation again.</p>
      <a href="/quotations" className="mt-4 inline-block text-blue-600 text-sm underline">← Back to Quotations</a>
    </div>
  );

  const advancePaid = invoice.advancePaid ?? 0;
  const balance = invoice.grandTotal - advancePaid;
  const isPaid = invoice.status === "Paid";

  const openPayment = () => {
    setPayType("advance");
    setPayAmount("");
    setPayError("");
    setPayDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    const addAmt = payType === "full" ? balance : parseFloat(payAmount);
    if (payType === "advance") {
      if (!payAmount || isNaN(addAmt) || addAmt <= 0) { setPayError("Valid amount is required."); return; }
      if (addAmt > balance) { setPayError(`Amount exceeds the remaining balance (${formatCurrency(balance)}).`); return; }
    }
    setPaying(true); setPayError("");
    try {
      const res = await fetch("/api/invoices/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advancePaid: advancePaid + addAmt }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setPayError(d.error ?? "Failed to record payment."); return; }
      setPayDialogOpen(false);
      fetchData();
    } finally { setPaying(false); }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/invoices"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={invoice.status} />
              {advancePaid > 0 && !isPaid && (
                <span className="text-xs text-gray-500">
                  Received <span className="font-semibold text-green-600">{formatCurrency(advancePaid)}</span> · Balance <span className="font-semibold text-orange-600">{formatCurrency(balance)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isPaid && (
            <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={openPayment}>
              <Wallet className="h-4 w-4" />Record Payment
            </Button>
          )}
          {isPaid && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 px-2">
              <BadgeCheck className="h-4 w-4" />Fully Paid
            </span>
          )}
          <Link href={"/invoices/" + id + "/edit"}>
            <Button variant="outline" className="gap-2"><Pencil className="h-4 w-4" />Edit</Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />Print
          </Button>
          <PDFDownloadButton
            elementId="printable-invoice"
            filename={"Zero-Pos-Invoice-" + invoice.invoiceNumber}
          />
        </div>
      </div>

      <PrintableInvoice
        invoice={invoice}
        businessName={settings?.businessName}
        businessPhone={settings?.phone ?? undefined}
        businessEmail={settings?.email ?? undefined}
        businessWeb={settings?.website ?? undefined}
        businessLogoUrl={settings?.logoUrl ?? undefined}
      />

      {/* Record Payment dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Payment — {invoice.invoiceNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1 text-sm">
              <p className="font-semibold text-gray-800">{invoice.customer?.name}</p>
              <div className="flex justify-between text-gray-500">
                <span>Invoice Total</span><span className="font-medium text-gray-700">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Already received</span><span className="font-medium text-green-600">{formatCurrency(advancePaid)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
                <span>Remaining balance</span><span className="text-orange-600">{formatCurrency(balance)}</span>
              </div>
            </div>

            {payError && <p className="text-sm text-red-500">{payError}</p>}

            <div className="space-y-1.5">
              <Label>Payment Type *</Label>
              <select
                value={payType}
                onChange={e => setPayType(e.target.value as "advance" | "full")}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="advance">Advance Payment (partial — more money expected)</option>
                <option value="full">Full Payment (settle remaining balance)</option>
              </select>
            </div>

            {payType === "advance" ? (
              <div className="space-y-1.5">
                <Label>Amount Received (LKR) *</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="e.g. 50,000"
                  autoFocus
                />
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700 font-medium">
                ✓ Remaining balance of {formatCurrency(balance)} will be recorded — invoice becomes Paid.
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={() => setPayDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleRecordPayment} disabled={paying} className="flex-1 bg-green-600 hover:bg-green-700">
                {paying ? "Saving..." : "Record Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
