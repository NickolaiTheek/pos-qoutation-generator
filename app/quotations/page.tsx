"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, FileDown, Printer, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchBar from "@/components/SearchBar";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Quotation } from "@/types";

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch("/api/quotations?" + params.toString());
      setQuotations(await res.json());
    } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;
    await fetch("/api/quotations/" + id, { method: "DELETE" });
    fetchQuotations();
  };

  const handleConvertToInvoice = async (q: Quotation) => {
    if (!confirm("Convert this quotation to an invoice?")) return;
    const settings = await fetch("/api/settings").then(r => r.json());
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: q.customerId,
        date: new Date().toISOString(),
        note: settings.defaultInvoiceNote ?? "",
        status: "Unpaid",
        quotationId: q.id,
        items: (q.items ?? []).map(i => ({
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
      const invoice = await res.json();
      router.push("/invoices/" + invoice.id);
    }
  };

  const STATUSES = ["", "Draft", "Sent", "Accepted", "Rejected"];

  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Quotations</h2>
          <p className="text-sm text-gray-500">{quotations.length} total</p>
        </div>
        <Link href="/quotations/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> New Quotation</Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search quotations..." />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : quotations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No quotations found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Link href={"/quotations/" + q.id} className="font-medium text-blue-600 hover:underline">{q.quotationNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <p>{q.customer?.name}</p>
                      <p className="text-xs text-gray-400">{q.customer?.mobile}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{formatDate(q.date)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(q.grandTotal)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={q.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={"/quotations/" + q.id}><Button variant="ghost" size="icon" title="View"><Eye className="h-3.5 w-3.5" /></Button></Link>
                        <Link href={"/quotations/" + q.id + "/edit"}><Button variant="ghost" size="icon" title="Edit"><Pencil className="h-3.5 w-3.5" /></Button></Link>
                        <Button variant="ghost" size="icon" title="Convert to Invoice" onClick={() => handleConvertToInvoice(q)}>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
