"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Settings } from "@/types";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(data => { setSettings(data); setLoading(false); });
  }, []);

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-5 max-w-2xl mx-auto w-full">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Configure your business information and defaults.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-sm">Business Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Business Name</Label>
              <Input value={settings.businessName ?? ""} onChange={e => handleChange("businessName", e.target.value)} placeholder="Your business name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={settings.phone ?? ""} onChange={e => handleChange("phone", e.target.value)} placeholder="+94 77 123 4567" />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={settings.email ?? ""} onChange={e => handleChange("email", e.target.value)} placeholder="info@business.com" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Textarea value={settings.address ?? ""} onChange={e => handleChange("address", e.target.value)} rows={2} className="resize-none" placeholder="Business address" />
            </div>
            <div className="space-y-1">
              <Label>Logo URL</Label>
              <Input value={settings.logoUrl ?? ""} onChange={e => handleChange("logoUrl", e.target.value)} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Default Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Default Quotation Note</Label>
              <Textarea value={settings.defaultQuotationNote ?? ""} onChange={e => handleChange("defaultQuotationNote", e.target.value)} rows={3} className="resize-none" />
            </div>
            <div className="space-y-1">
              <Label>Default Invoice Note</Label>
              <Textarea value={settings.defaultInvoiceNote ?? ""} onChange={e => handleChange("defaultInvoiceNote", e.target.value)} rows={3} className="resize-none" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Settings"}
          </Button>
          {saved && <p className="text-sm text-emerald-600 font-medium">Settings saved successfully!</p>}
        </div>
      </form>
    </div>
  );
}
