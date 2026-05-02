"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchBar from "@/components/SearchBar";
import ProductForm from "@/components/ProductForm";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

const CATEGORY_COLORS: Record<string, "default" | "success" | "warning" | "info" | "secondary"> = {
  Hardware: "default",
  Software: "info",
  Service: "success",
  Support: "warning",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?search=" + encodeURIComponent(search));
      setProducts(await res.json());
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/products/" + id, { method: "DELETE" });
    fetchProducts();
  };

  const handleToggleActive = async (product: Product) => {
    await fetch("/api/products/" + product.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, isActive: !product.isActive }),
    });
    fetchProducts();
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Products & Services</h2>
          <p className="text-sm text-gray-500">{products.length} total</p>
        </div>
        <Button onClick={() => { setEditProduct(undefined); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No products found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product / Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Default Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Warranty</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      {p.description && <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={CATEGORY_COLORS[p.category] ?? "secondary"}>
                        <Tag className="h-2.5 w-2.5 mr-1" />{p.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700">
                      {formatCurrency(p.defaultPrice)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{p.warranty ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleActive(p)}>
                        <Badge variant={p.isActive ? "success" : "secondary"}>
                          {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => { setEditProduct(p); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editProduct}
            onSuccess={() => { setDialogOpen(false); fetchProducts(); }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
