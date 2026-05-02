"use client";
import CustomerForm from "@/components/CustomerForm";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/types";
import { Building, Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | undefined>();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers?search=" + encodeURIComponent(search));
      setCustomers(await res.json());
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    await fetch("/api/customers/" + id, { method: "DELETE" });
    fetchCustomers();
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">{customers.length} total</p>
        </div>
        <Button onClick={() => { setEditCustomer(undefined); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, mobile, or business..." />
      <Card>
        <CardContent className="p-0">
          {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> :
           customers.length === 0 ? <div className="p-8 text-center text-gray-400">No customers found.</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600"><span className="flex items-center gap-1"><Phone className="h-3 w-3 text-gray-400" />{c.mobile}</span></td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-gray-400" />{c.email}</span>}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{c.businessName && <span className="flex items-center gap-1"><Building className="h-3 w-3 text-gray-400" />{c.businessName}</span>}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => { setEditCustomer(c); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <CustomerForm customer={editCustomer} onSuccess={() => { setDialogOpen(false); fetchCustomers(); }} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
