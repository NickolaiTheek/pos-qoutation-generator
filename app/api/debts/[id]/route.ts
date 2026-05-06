import { db, docToJSON } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const debtSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerMobile: z.string().optional(),
  description: z.string().optional(),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = debtSchema.parse(body);
    const paidAmount = data.paidAmount ?? 0;
    let status = data.status || "Pending";
    if (paidAmount >= data.totalAmount && data.totalAmount > 0) status = "Paid";
    else if (paidAmount > 0) status = "Partially Paid";

    const ref = doc(db, "debt_records", id);
    await updateDoc(ref, {
      customerName: data.customerName,
      customerMobile: data.customerMobile || null,
      description: data.description || null,
      totalAmount: data.totalAmount,
      paidAmount,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status,
      notes: data.notes || null,
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(ref);
    return NextResponse.json(docToJSON(snap));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update debt record" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, "debt_records", id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete debt record" }, { status: 500 });
  }
}
