import { db, docToJSON } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(1, "Mobile is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  businessName: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snap = await getDoc(doc(db, "customers", id));
    const customer = docToJSON(snap);
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = customerSchema.parse(body);

    const ref = doc(db, "customers", id);
    await updateDoc(ref, {
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
      address: data.address || null,
      businessName: data.businessName || null,
      notes: data.notes || null,
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(ref);
    return NextResponse.json(docToJSON(snap));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, "customers", id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
