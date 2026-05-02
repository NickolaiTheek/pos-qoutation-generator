"use client";

import SearchBar from "@/components/SearchBar";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";
import { CheckCircle, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch("/api/invoices?" + params.toString());
      setInvoices(await res.json());
    } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch("/api/invoices/" + id, { method: "DELETE" });
    fetchInvoices();
  };

  const handleMarkPaid = async (inv: Invoice) => {
    await fetch("/api/invoices/" + inv.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Paid" }),
    });
    fetchInvoices();
  };

  const STATUSES = ["", "Unpaid", "Paid", "Cancelled"];

  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
          <p className="text-sm text-gray-500">{invoices.length} total</p>
        </div>
        <Link href="/invoices/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> New Invoice</Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search invoices..." />
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
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No invoices found.</div>
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
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Link href={"/invoices/" + inv.id} className="font-medium text-blue-600 hover:underline">{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <p>{inv.customer?.name}</p>
                      <p className="text-xs text-gray-400">{inv.customer?.mobile}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(inv.grandTotal)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={"/invoices/" + inv.id}><Button variant="ghost" size="icon" title="View"><Eye className="h-3.5 w-3.5" /></Button></Link>
                        <Link href={"/invoices/" + inv.id + "/edit"}><Button variant="ghost" size="icon" title="Edit"><Pencil className="h-3.5 w-3.5" /></Button></Link>
                        {inv.status !== "Paid" && (
                          <Button variant="ghost" size="icon" title="Mark Paid" onClick={() => handleMarkPaid(inv)} className="text-emerald-500 hover:text-emerald-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(inv.id)} className="text-red-400 hover:text-red-600">
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
