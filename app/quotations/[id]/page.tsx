"use client";

import PDFDownloadButton from "@/components/PDFDownloadButton";
import PrintableQuotation from "@/components/PrintableQuotation";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import type { Quotation } from "@/types";
import { ArrowLeft, ArrowRight, FileText, Pencil, Printer, Receipt } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertAdvance, setConvertAdvance] = useState("");
  const [convertError, setConvertError] = useState("");
  const [converting, setConverting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/quotations/" + id).then(r => r.json()),
      fetch("/api/settings").then(r => r.json()),
    ]).then(([q, s]) => { setQuotation(q); setSettings(s); setLoading(false); });
  }, [id]);

  const handlePrint = () => { window.print(); };

  const handleConvert = async () => {
    if (!quotation) return;
    const advance = convertAdvance.trim() === "" ? 0 : parseFloat(convertAdvance);
    if (convertAdvance.trim() !== "" && (isNaN(advance) || advance < 0)) {
      setConvertError("Enter a valid advance amount.");
      return;
    }
    if (advance > quotation.grandTotal) {
      setConvertError("Advance payment cannot exceed the invoice total.");
      return;
    }
    setConverting(true);
    setConvertError("");
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: quotation.customerId,
          date: new Date().toISOString(),
          note: settings?.defaultInvoiceNote ?? "",
          status: "Unpaid",
          advancePaid: advance,
          quotationId: quotation.id,
          items: (quotation.items ?? []).map(i => ({
            productId: i.productId,
            name: i.name,
            description: i.description,
            category: i.category || "General",
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount,
            warranty: i.warranty,
          })),
        }),
      });
      if (res.ok) {
        const inv = await res.json();
        router.push("/invoices/" + inv.id);
      } else {
        const err = await res.json().catch(() => ({}));
        setConvertError(err.error ?? "Failed to create invoice.");
      }
    } finally {
      setConverting(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!quotation) return <div className="p-8 text-gray-400">Quotation not found.</div>;

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/quotations"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{quotation.quotationNumber}</h2>
            <StatusBadge status={quotation.status} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={"/quotations/" + id + "/edit"}>
            <Button variant="outline" className="gap-2"><Pencil className="h-4 w-4" />Edit</Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={handlePrint}><Printer className="h-4 w-4" />Print</Button>
          <PDFDownloadButton
            elementId="printable-quotation"
            filename={"Zero-Pos-Quotation-" + quotation.quotationNumber}
          />
          <Link href={"/quotations/" + id + "/advance"}>
            <Button variant="outline" className="gap-2"><Receipt className="h-4 w-4" />Advance Receipt</Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={() => { setConvertAdvance(""); setConvertError(""); setConvertOpen(true); }}>
            <ArrowRight className="h-4 w-4" />Convert to Invoice
          </Button>
        </div>
      </div>

      <Dialog open={convertOpen} onOpenChange={open => { setConvertOpen(open); if (!open) setConvertError(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <FileText className="h-5 w-5 text-blue-600" />
              Convert to Invoice
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              This will create a new invoice from quotation{" "}
              <span className="font-semibold text-gray-900">{quotation.quotationNumber}</span>.
            </p>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-700 flex justify-between">
              <span>Total amount</span>
              <span className="font-semibold">{formatCurrency(quotation.grandTotal)}</span>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Advance already paid (LKR)</label>
              <input
                type="number" min="0" step="0.01"
                value={convertAdvance}
                onChange={e => setConvertAdvance(e.target.value)}
                placeholder="0.00 — leave blank if none"
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(parseFloat(convertAdvance) || 0) > 0 && (
                <p className="text-xs">
                  <span className="text-green-600 font-medium">Advance {formatCurrency(parseFloat(convertAdvance) || 0)}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-orange-600 font-medium">Remaining {formatCurrency(Math.max(0, quotation.grandTotal - (parseFloat(convertAdvance) || 0)))}</span>
                </p>
              )}
            </div>
            {convertError && <p className="text-sm text-red-500">{convertError}</p>}
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setConvertOpen(false)} disabled={converting}>Cancel</Button>
            <Button onClick={handleConvert} disabled={converting} className="gap-2 bg-blue-600 hover:bg-blue-700">
              {converting ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div ref={printRef}>
      <PrintableQuotation
        quotation={quotation}
        businessName={settings?.businessName}
        businessPhone={settings?.phone ?? undefined}
        businessEmail={settings?.email ?? undefined}
        businessAddress={settings?.address ?? undefined}
        businessWeb={settings?.website ?? undefined}
      />
      </div>
    </div>
  );
}
