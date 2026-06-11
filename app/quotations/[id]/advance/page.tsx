"use client";

import PDFDownloadButton from "@/components/PDFDownloadButton";
import PrintableAdvance from "@/components/PrintableAdvance";
import { Button } from "@/components/ui/button";
import type { Quotation } from "@/types";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export default function AdvanceReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [advance, setAdvance] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());

  useEffect(() => {
    Promise.all([
      fetch("/api/quotations/" + id).then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([q, s]) => {
      setQuotation(q?.error ? null : q);
      setSettings(s?.error ? null : s);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!quotation) return <div className="p-8 text-gray-400">Quotation not found.</div>;

  const advanceNum = advance.trim() === "" ? null : Number(advance);

  return (
    <div className="space-y-4 w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div className="flex items-center gap-3">
          <Link href={"/quotations/" + id}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Advance Receipt</h2>
            <p className="text-xs text-gray-500">From {quotation.quotationNumber}</p>
          </div>
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-500 mb-1">Advance Amount (LKR)</label>
            <input
              type="number"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              placeholder="Leave blank to write by hand"
              className="h-9 w-52 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-500 mb-1">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="h-9 w-40 rounded-md border border-gray-300 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="">Tick by hand</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Card</option>
              <option>Cheque</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <Button variant="outline" className="gap-2 h-9" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />Print
          </Button>
          <PDFDownloadButton
            elementId="printable-advance"
            filename={"Zero-Pos-Advance-" + quotation.quotationNumber}
          />
        </div>
      </div>

      <PrintableAdvance
        quotation={quotation}
        advanceAmount={advanceNum}
        paymentMethod={method}
        receiptDate={date}
        businessName={settings?.businessName}
        businessPhone={settings?.phone ?? undefined}
        businessEmail={settings?.email ?? undefined}
        businessWeb={settings?.website ?? undefined}
        businessLogoUrl={settings?.logoUrl ?? undefined}
      />
    </div>
  );
}
