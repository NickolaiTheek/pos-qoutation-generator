"use client";

import PDFDownloadButton from "@/components/PDFDownloadButton";
import PrintableInvoice from "@/components/PrintableInvoice";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/types";
import { ArrowLeft, CheckCircle, Pencil, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      fetch("/api/invoices/" + id).then(r => r.json()),
      fetch("/api/settings").then(r => r.json()),
    ]).then(([inv, s]) => { setInvoice(inv); setSettings(s); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleMarkPaid = async () => {
    await fetch("/api/invoices/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Paid" }),
    });
    fetchData();
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!invoice) return <div className="p-8 text-gray-400">Invoice not found.</div>;

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/invoices"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h2>
            <StatusBadge status={invoice.status} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status !== "Paid" && (
            <Button variant="outline" className="gap-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={handleMarkPaid}>
              <CheckCircle className="h-4 w-4" />Mark as Paid
            </Button>
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
        businessAddress={settings?.address ?? undefined}
        businessWeb={settings?.website ?? undefined}
      />
    </div>
  );
}
