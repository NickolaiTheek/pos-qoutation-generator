"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { LineItem, Product } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface ItemTableProps {
  items: LineItem[];
  products: Product[];
  onChange: (items: LineItem[]) => void;
  readOnly?: boolean;
}

const emptyItem = (): LineItem => ({
  name: "",
  description: "",
  category: "General",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  total: 0,
  warranty: "",
  productId: null,
});

export default function ItemTable({ items, products, onChange, readOnly }: ItemTableProps) {
  const updateItem = (index: number, field: keyof LineItem, value: string | number | null) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      newItem.total = newItem.quantity * newItem.unitPrice - newItem.discount;
      return newItem;
    });
    onChange(updated);
  };

  const addItem = () => onChange([...items, emptyItem()]);

  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        productId: product.id,
        name: product.name,
        description: product.description ?? "",
        category: product.category ?? "General",
        unitPrice: product.defaultPrice,
        warranty: product.warranty ?? "",
        total: item.quantity * product.defaultPrice - item.discount,
      };
    });
    onChange(updated);
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discountTotal = items.reduce((s, i) => s + i.discount, 0);
  const grandTotal = subtotal - discountTotal;

  if (readOnly) {
    return (
      <div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-blue-50">
              <th className="py-2.5 px-3 text-left font-semibold text-gray-600 text-xs uppercase">Item</th>
              <th className="py-2.5 px-3 text-center font-semibold text-gray-600 text-xs uppercase w-16">Qty</th>
              <th className="py-2.5 px-3 text-right font-semibold text-gray-600 text-xs uppercase w-28">Unit Price</th>
              <th className="py-2.5 px-3 text-right font-semibold text-gray-600 text-xs uppercase w-24">Discount</th>
              <th className="py-2.5 px-3 text-right font-semibold text-gray-600 text-xs uppercase w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 px-3">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  {item.warranty && <p className="text-xs text-blue-600 mt-0.5">{item.warranty}</p>}
                </td>
                <td className="py-3 px-3 text-center text-gray-700">{item.quantity}</td>
                <td className="py-3 px-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 px-3 text-right text-gray-500">{item.discount > 0 ? formatCurrency(item.discount) : "—"}</td>
                <td className="py-3 px-3 text-right font-semibold text-gray-800">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>Discount</span><span>- {formatCurrency(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-1.5">
              <span>Grand Total</span><span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase">Product (optional)</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase pl-2">Name *</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase pl-2">Description</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase pl-2 w-28">Category</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase pl-2 w-16">Qty *</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase pl-2 w-28">Unit Price *</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase pl-2 w-24">Discount</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase pl-2">Warranty</th>
              <th className="pb-2 text-right text-xs font-medium text-gray-500 uppercase pl-2 w-28">Total</th>
              <th className="pb-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2 pr-2">
                  <select
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.productId ?? ""}
                    onChange={(e) => selectProduct(i, e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {products.filter((p) => p.isActive).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-2">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    placeholder="Item name"
                    className="min-w-[160px]"
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="Description"
                    className="min-w-[120px]"
                  />
                </td>
                <td className="py-2 pr-2">
                  <select
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.category || "General"}
                    onChange={(e) => updateItem(i, "category", e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Service">Service</option>
                    <option value="Support">Support</option>
                  </select>
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 1)}
                    className="w-16"
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="w-28"
                  />
                </td>
                <td className="py-2 pr-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) => updateItem(i, "discount", parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </td>
                <td className="py-2 pr-2">
                  <div className="flex gap-1 min-w-[140px]">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.warranty ? parseInt(item.warranty) || "" : ""}
                      onChange={(e) => {
                        const num = e.target.value;
                        const unit = item.warranty?.split(" ").slice(1).join(" ") || "Year(s)";
                        updateItem(i, "warranty", num ? `${num} ${unit}` : "");
                      }}
                      placeholder="0"
                      className="w-16"
                    />
                    <select
                      className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.warranty?.split(" ").slice(1).join(" ") || "Year(s)"}
                      onChange={(e) => {
                        const num = item.warranty ? parseInt(item.warranty) || "" : "";
                        updateItem(i, "warranty", num !== "" ? `${num} ${e.target.value}` : "");
                      }}
                    >
                      <option value="Year(s)">Year(s)</option>
                      <option value="Month(s)">Month(s)</option>
                    </select>
                  </div>
                </td>
                <td className="py-2 pr-2 text-right font-medium text-gray-700 whitespace-nowrap">
                  {formatCurrency(item.total)}
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Add Item
      </Button>

      <div className="flex justify-end">
        <div className="w-64 space-y-1.5 border-t border-gray-100 pt-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Discount</span><span>- {formatCurrency(discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-1.5">
            <span>Grand Total</span><span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
