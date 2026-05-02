"use client";

import ItemTable from "@/components/ItemTable";
import CustomerForm from "@/components/CustomerForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Customer, LineItem, Product, Settings } from "@/types";
import { ArrowLeft, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function emptyItem(): LineItem {
  return { productId: "", name: "", description: "", quantity: 1, unitPrice: 0, discount: 0, warranty: "", total: 0 };
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("Draft");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const refreshCustomers = () =>
    fetch("/api/customers").then(r => r.json()).then(setCustomers);

  useEffect(() => {
    refreshCustomers();
    fetch("/api/products?active=true").then(r => r.json()).then(setProducts);
    fetch("/api/settings").then(r => r.json()).then((s: Settings) => setNote(s.defaultQuotationNote ?? ""));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { setError("Please select a customer."); return; }
    if (!items.some(i => i.name.trim())) { setError("Add at least one item."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          date: new Date(date).toISOString(),
          status,
          note,
          items: items.filter(i => i.name.trim()).map(i => ({
            productId: i.productId || undefined,
            name: i.name,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount,
            warranty: i.warranty,
          })),
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to create quotation."); return; }
      const data = await res.json();
      router.push("/quotations/" + data.id);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center gap-3">
        <Link href="/quotations"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h2 className="text-lg font-semibold text-gray-900">New Quotation</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-sm">Quotation Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-1">
              <Label>Customer *</Label>
              <div className="flex gap-2">
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="flex-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.businessName ? `${c.businessName} (${c.name})` : c.name} — {c.mobile}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="icon" title="Add new customer" onClick={() => setAddCustomerOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Date *</Label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Items</CardTitle></CardHeader>
          <CardContent>
            <ItemTable items={items} products={products} onChange={setItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Note</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="resize-none" />
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Quotation"}
          </Button>
          <Link href="/quotations"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </form>

      <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <CustomerForm
            onSuccess={(newCustomer) => {
              setAddCustomerOpen(false);
              refreshCustomers().then(() => setCustomerId(newCustomer.id));
            }}
            onCancel={() => setAddCustomerOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
