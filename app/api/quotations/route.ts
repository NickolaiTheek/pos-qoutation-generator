import { db, docToJSON, docsToJSON } from "@/lib/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore/lite";
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

const quotationSchema = z.object({
  customerId: z.string().min(1).optional().nullable(),
  date: z.string(),
  note: z.string().optional(),
  status: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

async function getNextQuotationNumber(): Promise<string> {
  const snap = await getDocs(
    query(collection(db, "quotations"), orderBy("quotationNumber", "desc"), limit(1))
  );
  if (snap.empty) return "QTN-00001";
  const last = snap.docs[0].data().quotationNumber as string;
  const num = parseInt(last.replace("QTN-", ""), 10);
  return `QTN-${String(num + 1).padStart(5, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").toLowerCase();
    const status = searchParams.get("status") ?? "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const snap = await getDocs(query(collection(db, "quotations"), orderBy("createdAt", "desc")));
    let quotations = docsToJSON(snap.docs);

    if (search) {
      quotations = quotations.filter((q) => {
        const customer = q.customer as Record<string, unknown> | null;
        return (
          (q.quotationNumber as string).toLowerCase().includes(search) ||
          ((customer?.name as string) ?? "").toLowerCase().includes(search) ||
          ((customer?.mobile as string) ?? "").toLowerCase().includes(search)
        );
      });
    }
    if (status) quotations = quotations.filter((q) => q.status === status);
    if (dateFrom) quotations = quotations.filter((q) => new Date(q.date as string) >= new Date(dateFrom));
    if (dateTo) quotations = quotations.filter((q) => new Date(q.date as string) <= new Date(dateTo));

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("Quotations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = quotationSchema.parse(body);

    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountTotal = data.items.reduce((sum, item) => sum + item.discount, 0);
    const grandTotal = subtotal - discountTotal;

    const quotationNumber = await getNextQuotationNumber();

    let customer: Record<string, unknown> | null = null;
    if (data.customerId) {
      const customerSnap = await getDoc(doc(db, "customers", data.customerId));
      customer = docToJSON(customerSnap);
    }

    const ref = await addDoc(collection(db, "quotations"), {
      quotationNumber,
      customerId: data.customerId || null,
      customer,
      date: new Date(data.date),
      subtotal,
      discountTotal,
      grandTotal,
      note: data.note || null,
      status: data.status || "Draft",
      items: data.items.map((item) => ({
        id: crypto.randomUUID(),
        productId: item.productId || null,
        name: item.name,
        description: item.description || null,
        category: item.category || "General",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.quantity * item.unitPrice - item.discount,
        warranty: item.warranty || null,
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const snap = await getDoc(ref);
    return NextResponse.json(docToJSON(snap), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    console.error("Quotations POST error:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}

