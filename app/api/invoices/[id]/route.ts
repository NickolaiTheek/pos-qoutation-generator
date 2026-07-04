import { db, docToJSON } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore/lite";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional().default("General"),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  warranty: z.string().optional(),
});

const invoiceUpdateSchema = z.object({
  customerId: z.string().optional().nullable(),
  date: z.string().optional(),
  note: z.string().optional(),
  status: z.string().optional(),
  advancePaid: z.number().min(0).optional(),
  items: z.array(itemSchema).min(1).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snap = await getDoc(doc(db, "invoices", id));
    const invoice = docToJSON(snap);
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = invoiceUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (data.customerId !== undefined) {
      updateData.customerId = data.customerId ?? null;
      if (data.customerId) {
        const customerSnap = await getDoc(doc(db, "customers", data.customerId));
        updateData.customer = docToJSON(customerSnap);
      } else {
        updateData.customer = null;
      }
    }

    if (data.date) updateData.date = new Date(data.date);
    if (data.note !== undefined) updateData.note = data.note || null;
    if (data.status) updateData.status = data.status;

    if (data.items) {
      const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const discountTotal = data.items.reduce((sum, item) => sum + item.discount, 0);
      updateData.subtotal = subtotal;
      updateData.discountTotal = discountTotal;
      updateData.grandTotal = subtotal - discountTotal;
      updateData.items = data.items.map((item) => ({
        id: crypto.randomUUID(),
        invoiceId: id,
        productId: item.productId || null,
        name: item.name,
        description: item.description || null,
        category: item.category || "General",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.quantity * item.unitPrice - item.discount,
        warranty: item.warranty || null,
      }));
    }

    // Payment tracking: a positive advance auto-derives the status
    // (runs after items so a same-request grandTotal change is respected)
    if (data.advancePaid !== undefined) {
      updateData.advancePaid = data.advancePaid;
      let grandTotal = updateData.grandTotal as number | undefined;
      if (grandTotal === undefined) {
        const current = await getDoc(doc(db, "invoices", id));
        grandTotal = (current.data()?.grandTotal as number) ?? 0;
      }
      if (data.advancePaid > 0) {
        updateData.status = data.advancePaid >= grandTotal && grandTotal > 0 ? "Paid" : "Partially Paid";
      } else if (updateData.status === "Partially Paid") {
        // advance removed — a stale Partially Paid label makes no sense
        updateData.status = "Unpaid";
      }
    }

    const ref = doc(db, "invoices", id);
    await updateDoc(ref, updateData);
    const snap = await getDoc(ref);
    return NextResponse.json(docToJSON(snap));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, "invoices", id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
