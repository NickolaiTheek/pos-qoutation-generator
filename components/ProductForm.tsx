"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(["Hardware", "Software", "Service", "Support"]),
  defaultPrice: z.preprocess((v) => parseFloat(String(v)), z.number().min(0, "Price must be 0 or more")),
  warranty: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema> & { defaultPrice: number };

interface ProductFormProps {
  product?: Product;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      category: (product?.category as FormData["category"]) ?? "Hardware",
      defaultPrice: product?.defaultPrice ?? 0,
      warranty: product?.warranty ?? "",
      isActive: product?.isActive ?? true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save product");
      const saved: Product = await res.json();
      onSuccess(saved);
    } catch {
      setError("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Product / Service Name *</Label>
        <Input id="name" {...register("name")} placeholder="Product name" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Select id="category" {...register("category")}>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Service">Service</option>
            <option value="Support">Support</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="defaultPrice">Default Price (LKR) *</Label>
          <Input
            id="defaultPrice"
            type="number"
            step="0.01"
            {...register("defaultPrice")}
            placeholder="0.00"
          />
          {errors.defaultPrice && <p className="text-xs text-red-500">{errors.defaultPrice.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Product description..."
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="warranty">Warranty</Label>
        <Input id="warranty" {...register("warranty")} placeholder="e.g. One Year Warranty" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" {...register("isActive")} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
        <Label htmlFor="isActive">Active</Label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
