import { db, docToJSON, docsToJSON } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").toLowerCase();
    const status = searchParams.get("status") ?? "";

    const snap = await getDocs(query(collection(db, "debt_records"), orderBy("createdAt", "desc")));
    let debts = docsToJSON(snap.docs);

    if (search) {
      debts = debts.filter(
        (d) =>
          (d.customerName as string).toLowerCase().includes(search) ||
          ((d.customerMobile as string) ?? "").toLowerCase().includes(search)
      );
    }
    if (status) debts = debts.filter((d) => d.status === status);

    return NextResponse.json(debts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = debtSchema.parse(body);
    const paidAmount = data.paidAmount ?? 0;
    let status = data.status || "Pending";
    if (paidAmount >= data.totalAmount && data.totalAmount > 0) status = "Paid";
    else if (paidAmount > 0) status = "Partially Paid";

    const ref = await addDoc(collection(db, "debt_records"), {
      customerName: data.customerName,
      customerMobile: data.customerMobile || null,
      description: data.description || null,
      totalAmount: data.totalAmount,
      paidAmount,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status,
      notes: data.notes || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(doc(db, "debt_records", ref.id));
    return NextResponse.json(docToJSON(snap), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create debt record" }, { status: 500 });
  }
}
