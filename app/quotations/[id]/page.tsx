"use client";

import PDFDownloadButton from "@/components/PDFDownloadButton";
import PrintableQuotation from "@/components/PrintableQuotation";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Quotation } from "@/types";
import { ArrowLeft, ArrowRight, Pencil, Printer } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/quotations/" + id).then(r => r.json()),
      fetch("/api/settings").then(r => r.json()),
    ]).then(([q, s]) => { setQuotation(q); setSettings(s); setLoading(false); });
  }, [id]);

  const handlePrint = () => { window.print(); };

  const handleConvert = async () => {
    if (!quotation || !confirm("Convert to invoice?")) return;
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: quotation.customerId,
        date: new Date().toISOString(),
        note: settings?.defaultInvoiceNote ?? "",
        status: "Unpaid",
        quotationId: quotation.id,
        items: (quotation.items ?? []).map(i => ({
          productId: i.productId,
          name: i.name,
          description: i.description,
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
          <Button variant="outline" className="gap-2" onClick={handleConvert}>
            <ArrowRight className="h-4 w-4" />Convert to Invoice
          </Button>
        </div>
      </div>

      <div ref={printRef}>
      <PrintableQuotation quotation={quotation} businessName={settings?.businessName} />
      </div>
    </div>
  );
}
