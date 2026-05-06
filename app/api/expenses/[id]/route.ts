import { db, docToJSON } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore/lite";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = expenseSchema.parse(body);

    const ref = doc(db, "expenses", id);
    await updateDoc(ref, {
      title: data.title,
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      date: new Date(data.date),
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(ref);
    return NextResponse.json(docToJSON(snap));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, "expenses", id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
