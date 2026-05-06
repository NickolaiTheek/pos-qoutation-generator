import { db, docsToJSON } from "@/lib/firebase";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore/lite";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
  quotationAmount: z.number().min(0).optional().nullable(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").toLowerCase();
    const status = searchParams.get("status") ?? "";

    const snap = await getDocs(query(collection(db, "leads"), orderBy("createdAt", "desc")));
    let leads = docsToJSON(snap.docs);

    if (search) {
      leads = leads.filter(
        (l) =>
          (l.name as string).toLowerCase().includes(search) ||
          ((l.businessName as string) ?? "").toLowerCase().includes(search) ||
          ((l.mobile as string) ?? "").toLowerCase().includes(search)
      );
    }
    if (status) leads = leads.filter((l) => l.status === status);

    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = leadSchema.parse(body);

    const ref = await addDoc(collection(db, "leads"), {
      name: data.name,
      mobile: data.mobile || null,
      businessName: data.businessName || null,
      address: data.address || null,
      quotationAmount: data.quotationAmount ?? null,
      notes: data.notes || null,
      status: data.status || "New",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        id: ref.id,
        name: data.name,
        mobile: data.mobile || null,
        businessName: data.businessName || null,
        address: data.address || null,
        notes: data.notes || null,
        status: data.status || "New",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
