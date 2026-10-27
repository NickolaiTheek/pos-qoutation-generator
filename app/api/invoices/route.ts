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

const invoiceSchema = z.object({
  quotationId: z.string().optional().nullable(),
  customerId: z.string().min(1).optional().nullable(),
  date: z.string(),
  note: z.string().optional(),
  status: z.string().optional(),
  advancePaid: z.number().min(0).optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

async function getNextInvoiceNumber(): Promise<string> {
  const snap = await getDocs(
    query(collection(db, "invoices"), orderBy("invoiceNumber", "desc"), limit(1))
  );
  if (snap.empty) return "INV-00001";
  const last = snap.docs[0].data().invoiceNumber as string;
  const num = parseInt(last.replace("INV-", ""), 10);
  return `INV-${String(num + 1).padStart(5, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").toLowerCase();
    const status = searchParams.get("status") ?? "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const snap = await getDocs(query(collection(db, "invoices"), orderBy("createdAt", "desc")));
    let invoices = docsToJSON(snap.docs);

    if (search) {
      invoices = invoices.filter((inv) => {
        const customer = inv.customer as Record<string, unknown> | null;
        return (
          (inv.invoiceNumber as string).toLowerCase().includes(search) ||
          ((customer?.name as string) ?? "").toLowerCase().includes(search) ||
          ((customer?.mobile as string) ?? "").toLowerCase().includes(search)
        );
      });
    }
    if (status) invoices = invoices.filter((inv) => inv.status === status);
    if (dateFrom) invoices = invoices.filter((inv) => new Date(inv.date as string) >= new Date(dateFrom));
    if (dateTo) invoices = invoices.filter((inv) => new Date(inv.date as string) <= new Date(dateTo));

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Invoices GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = invoiceSchema.parse(body);

    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountTotal = data.items.reduce((sum, item) => sum + item.discount, 0);
    const grandTotal = subtotal - discountTotal;
    const advancePaid = data.advancePaid ?? 0;
    if (advancePaid > grandTotal) {
      return NextResponse.json({ error: "Advance payment cannot exceed the invoice total." }, { status: 400 });
    }
    const status = advancePaid <= 0
      ? (data.status || "Unpaid")
      : advancePaid >= grandTotal && grandTotal > 0
        ? "Paid"
        : "Partially Paid";

    const invoiceNumber = await getNextInvoiceNumber();

    let customer: Record<string, unknown> | null = null;
    if (data.customerId) {
      const customerSnap = await getDoc(doc(db, "customers", data.customerId));
      customer = docToJSON(customerSnap);
    }

    const ref = await addDoc(collection(db, "invoices"), {
      invoiceNumber,
      quotationId: data.quotationId || null,
      customerId: data.customerId || null,
      customer,
      date: new Date(data.date),
      subtotal,
      discountTotal,
      grandTotal,
      note: data.note || null,
      status,
      advancePaid,
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
    console.error("Invoices POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
