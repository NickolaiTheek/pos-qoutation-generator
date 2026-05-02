"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, FileText, Receipt, Users, Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SummaryCards from "@/components/SummaryCards";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { label: "Create Quotation", href: "/quotations/new", icon: PlusCircle, color: "bg-blue-600" },
    { label: "Create Invoice", href: "/invoices/new", icon: PlusCircle, color: "bg-emerald-600" },
    { label: "View Quotations", href: "/quotations", icon: FileText, color: "bg-violet-600" },
    { label: "View Invoices", href: "/invoices", icon: Receipt, color: "bg-amber-500" },
    { label: "Manage Customers", href: "/customers", icon: Users, color: "bg-pink-500" },
    { label: "Manage Products", href: "/products", icon: Package, color: "bg-cyan-600" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-center group"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-5 h-20 animate-pulse bg-gray-50 rounded-xl" /></Card>
          ))}
        </div>
      ) : (
        <SummaryCards
          totalQuotations={stats?.totalQuotations ?? 0}
          totalInvoices={stats?.totalInvoices ?? 0}
          totalQuotationValue={stats?.totalQuotationValue ?? 0}
          totalInvoiceValue={stats?.totalInvoiceValue ?? 0}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Quotations</CardTitle>
              <Link href="/quotations">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!stats?.recentQuotations?.length ? (
              <p className="text-sm text-gray-400 py-4 text-center">No quotations yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.recentQuotations.map((q) => (
                  <Link key={q.id} href={`/quotations/${q.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{q.quotationNumber}</p>
                      <p className="text-xs text-gray-500">{q.customer?.name} · {formatDate(q.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{formatCurrency(q.grandTotal)}</p>
                      <StatusBadge status={q.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Invoices</CardTitle>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!stats?.recentInvoices?.length ? (
              <p className="text-sm text-gray-400 py-4 text-center">No invoices yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.recentInvoices.map((inv) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{inv.customer?.name} · {formatDate(inv.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{formatCurrency(inv.grandTotal)}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
