"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { DebtRecord, Expense, Lead } from "@/types";
import {
    CreditCard,
    Pencil,
    Plus,
    ShoppingBag,
    Target,
    Trash2,
    TrendingDown,
    TrendingUp,
    Wallet
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const EXPENSE_CATEGORIES = ["Delivery", "Equipment", "Marketing", "Office", "Travel", "Utilities", "Other"];
const PERSONS = ["Theekshana", "Praveen"] as const;
type Person = (typeof PERSONS)[number];
const LEAD_STATUSES = ["New", "Contacted", "Interested", "Quoted", "Won", "Lost"];
const DEBT_STATUSES = ["Pending", "Partially Paid", "Paid"];

type Tab = "overview" | "expenses" | "leads" | "debts";

interface Summary {
  totalExpenses: number;
  totalRevenue: number;
  totalDebt: number;
  totalDebtPaid: number;
  outstandingDebt: number;
  expenseByCategory: { category: string; total: number }[];
  expenseByPerson: { person: string; total: number }[];
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function OverviewTab({ summary }: { summary: Summary | null }) {
  if (!summary) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  const netProfit = summary.totalRevenue - summary.totalExpenses;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Revenue (Paid)</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-100 bg-green-50 rounded-lg p-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-100 bg-red-50 rounded-lg p-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Net Profit</p>
                <p className={`text-xl font-bold ${netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatCurrency(netProfit)}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-100 bg-blue-50 rounded-lg p-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Outstanding Debt</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(summary.outstandingDebt)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-100 bg-orange-50 rounded-lg p-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {((summary.expenseByPerson ?? []).length > 0 || summary.expenseByCategory.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(summary.expenseByPerson ?? []).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Expenses by Partner</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(summary.expenseByPerson ?? []).map(e => (
                    <div key={e.person} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {e.person.charAt(0)}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{e.person}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-red-600">{formatCurrency(e.total)}</span>
                        {summary.totalExpenses > 0 && (
                          <p className="text-xs text-gray-400">{Math.round((e.total / summary.totalExpenses) * 100)}%</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {summary.expenseByCategory.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Expenses by Category</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.expenseByCategory.map(e => (
                    <div key={e.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{e.category}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{formatCurrency(e.total)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Debt Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Debt Issued</span>
              <span className="font-medium">{formatCurrency(summary.totalDebt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Collected</span>
              <span className="font-medium text-green-600">{formatCurrency(summary.totalDebtPaid)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-semibold">
              <span>Still Outstanding</span>
              <span className="text-orange-600">{formatCurrency(summary.outstandingDebt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── EXPENSES TAB ────────────────────────────────────────────────────────────
function ExpensesTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({ title: "", amount: "", category: "Delivery", person: "Theekshana" as Person, description: "", date: today });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      setExpenses(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const openAdd = () => {
    setEditExpense(null);
    setForm({ title: "", amount: "", category: "Delivery", person: "Theekshana", description: "", date: today });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditExpense(e);
    setForm({ title: e.title, amount: String(e.amount), category: e.category, person: (e.person ?? "Theekshana") as Person, description: e.description ?? "", date: e.date.split("T")[0] });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.amount || isNaN(Number(form.amount))) { setError("Valid amount is required."); return; }
    setSaving(true); setError("");
    try {
      const body = { title: form.title.trim(), amount: parseFloat(form.amount), category: form.category, person: form.person, description: form.description, date: new Date(form.date).toISOString() };
      const url = editExpense ? `/api/expenses/${editExpense.id}` : "/api/expenses";
      const method = editExpense ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to save."); return; }
      setDialogOpen(false);
      fetchExpenses();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{expenses.length} records · Total: <span className="font-semibold text-red-600">{formatCurrency(total)}</span></p>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Expense</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No expenses yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Person</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{e.title}</p>
                      {e.description && <p className="text-xs text-gray-400 mt-0.5">{e.description}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        e.person === "Theekshana" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>{e.person ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{e.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{new Date(e.date).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(e.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <DialogContent>
          <DialogHeader><DialogTitle>{editExpense ? "Edit Expense" : "Add Expense"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Delivery to Galle" />
            </div>
            <div className="space-y-1.5">
              <Label>Paid by (Partner) *</Label>
              <div className="grid grid-cols-2 gap-3">
                {PERSONS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, person: p }))}
                    className={`h-10 rounded-lg border-2 text-sm font-medium transition-colors ${
                      form.person === p
                        ? p === "Theekshana"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Amount (LKR) *</Label>
                <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Additional details..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? "Saving..." : editExpense ? "Update" : "Add Expense"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── LEADS TAB ───────────────────────────────────────────────────────────────
const LEAD_STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-purple-100 text-purple-700",
  Interested: "bg-yellow-100 text-yellow-700",
  Quoted: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({ name: "", mobile: "", businessName: "", address: "", notes: "", status: "New" });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch("/api/leads?" + params.toString());
      setLeads(await res.json());
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const openAdd = () => {
    setEditLead(null);
    setForm({ name: "", mobile: "", businessName: "", address: "", notes: "", status: "New" });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (l: Lead) => {
    setEditLead(l);
    setForm({ name: l.name, mobile: l.mobile ?? "", businessName: l.businessName ?? "", address: l.address ?? "", notes: l.notes ?? "", status: l.status });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError("");
    try {
      const body = { name: form.name.trim(), mobile: form.mobile, businessName: form.businessName, address: form.address, notes: form.notes, status: form.status };
      const url = editLead ? `/api/leads/${editLead.id}` : "/api/leads";
      const method = editLead ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to save."); return; }
      setDialogOpen(false);
      fetchLeads();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    fetchLeads();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{leads.length} leads</p>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Lead</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No leads found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Mobile</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{l.name}</p>
                      {l.address && <p className="text-xs text-gray-400 mt-0.5">{l.address}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{l.businessName ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{l.mobile ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${LEAD_STATUS_COLORS[l.status] ?? "bg-gray-100 text-gray-700"}`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <DialogContent>
          <DialogHeader><DialogTitle>{editLead ? "Edit Lead" : "Add Lead / Prospect"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Owner / Contact name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Mobile</Label>
                <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="07X XXX XXXX" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Business Name</Label>
              <Input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} placeholder="e.g. Perera Grocery" />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Location / area" />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this lead..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? "Saving..." : editLead ? "Update" : "Add Lead"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DEBTS TAB ───────────────────────────────────────────────────────────────
const DEBT_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-red-100 text-red-700",
  "Partially Paid": "bg-yellow-100 text-yellow-700",
  Paid: "bg-green-100 text-green-700",
};

function DebtsTab() {
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDebt, setEditDebt] = useState<DebtRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({ customerName: "", customerMobile: "", description: "", totalAmount: "", paidAmount: "0", dueDate: "", notes: "" });

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch("/api/debts?" + params.toString());
      setDebts(await res.json());
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);

  const openAdd = () => {
    setEditDebt(null);
    setForm({ customerName: "", customerMobile: "", description: "", totalAmount: "", paidAmount: "0", dueDate: "", notes: "" });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (d: DebtRecord) => {
    setEditDebt(d);
    setForm({ customerName: d.customerName, customerMobile: d.customerMobile ?? "", description: d.description ?? "", totalAmount: String(d.totalAmount), paidAmount: String(d.paidAmount), dueDate: d.dueDate ? d.dueDate.split("T")[0] : "", notes: d.notes ?? "" });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.customerName.trim()) { setError("Customer name is required."); return; }
    if (!form.totalAmount || isNaN(Number(form.totalAmount))) { setError("Valid total amount is required."); return; }
    setSaving(true); setError("");
    try {
      const body = { customerName: form.customerName.trim(), customerMobile: form.customerMobile, description: form.description, totalAmount: parseFloat(form.totalAmount), paidAmount: parseFloat(form.paidAmount) || 0, dueDate: form.dueDate || undefined, notes: form.notes };
      const url = editDebt ? `/api/debts/${editDebt.id}` : "/api/debts";
      const method = editDebt ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to save."); return; }
      setDialogOpen(false);
      fetchDebts();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this debt record?")) return;
    await fetch(`/api/debts/${id}`, { method: "DELETE" });
    fetchDebts();
  };

  const totalOutstanding = debts.filter(d => d.status !== "Paid").reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{debts.length} records · Outstanding: <span className="font-semibold text-orange-600">{formatCurrency(totalOutstanding)}</span></p>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All</option>
            {DEBT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Debt</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : debts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No debt records found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {debts.map(d => {
                  const balance = d.totalAmount - d.paidAmount;
                  return (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{d.customerName}</p>
                        {d.customerMobile && <p className="text-xs text-gray-400">{d.customerMobile}</p>}
                        {d.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{d.description}</p>}
                        {d.dueDate && <p className="text-xs text-orange-500 mt-0.5">Due: {new Date(d.dueDate).toLocaleDateString("en-GB")}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-700">{formatCurrency(d.totalAmount)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{formatCurrency(d.paidAmount)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-600">{formatCurrency(balance)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${DEBT_STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-700"}`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editDebt ? "Edit Debt Record" : "Add Debt Record"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <Label>Customer Name *</Label>
                <Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Who owes you?" />
              </div>
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <Label>Mobile</Label>
                <Input value={form.customerMobile} onChange={e => setForm(f => ({ ...f, customerMobile: e.target.value }))} placeholder="07X XXX XXXX" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>What was sold / description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. POS System + Cash Drawer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Total Amount (LKR) *</Label>
                <Input type="number" min="0" step="0.01" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Amount Paid (LKR)</Label>
                <Input type="number" min="0" step="0.01" value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Due Date (optional)</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment agreement, etc." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? "Saving..." : editDebt ? "Update" : "Add Debt"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/business/summary").then(r => r.json()).then(setSummary);
  }, [activeTab]); // refresh summary on tab change

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <TrendingUp className="h-4 w-4" /> },
    { key: "expenses", label: "Expenses", icon: <TrendingDown className="h-4 w-4" /> },
    { key: "leads", label: "Leads", icon: <Target className="h-4 w-4" /> },
    { key: "debts", label: "Debts", icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-5 w-full">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Business Management</h2>
        <p className="text-sm text-gray-500">Track expenses, leads, and debt records</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab summary={summary} />}
      {activeTab === "expenses" && <ExpensesTab />}
      {activeTab === "leads" && <LeadsTab />}
      {activeTab === "debts" && <DebtsTab />}
    </div>
  );
}
