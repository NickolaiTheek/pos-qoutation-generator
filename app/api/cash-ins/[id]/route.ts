import { db, docToJSON } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore/lite";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PERSONS = ["Theekshana", "Praveen"] as const;

const cashInSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0),
  person: z.enum(PERSONS),
  description: z.string().optional(),
  date: z.string(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = cashInSchema.parse(body);

    const ref = doc(db, "cash_ins", id);
    await updateDoc(ref, {
      title: data.title,
      amount: data.amount,
      person: data.person,
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
    return NextResponse.json({ error: "Failed to update cash in" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, "cash_ins", id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete cash in" }, { status: 500 });
  }
}
