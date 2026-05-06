import { db, docsToJSON } from "@/lib/firebase";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").toLowerCase();

    const snap = await getDocs(query(collection(db, "customers"), orderBy("createdAt", "desc")));
    let customers = docsToJSON(snap.docs);

    if (search) {
      customers = customers.filter(
        (c) =>
          (c.name as string).toLowerCase().includes(search) ||
          (c.mobile as string).toLowerCase().includes(search) ||
          ((c.businessName as string) ?? "").toLowerCase().includes(search)
      );
    }

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = customerSchema.parse(body);

    const ref = await addDoc(collection(db, "customers"), {
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
      address: data.address || null,
      businessName: data.businessName || null,
      notes: data.notes || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        id: ref.id,
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        address: data.address || null,
        businessName: data.businessName || null,
        notes: data.notes || null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    console.error("Customers POST error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
