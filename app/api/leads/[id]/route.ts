import { db, docToJSON } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore/lite";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = leadSchema.parse(body);

    const ref = doc(db, "leads", id);
    await updateDoc(ref, {
      name: data.name,
      mobile: data.mobile || null,
      businessName: data.businessName || null,
      address: data.address || null,
      notes: data.notes || null,
      status: data.status || "New",
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(ref);
    return NextResponse.json(docToJSON(snap));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, "leads", id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
