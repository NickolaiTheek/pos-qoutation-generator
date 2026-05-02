import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  warranty: z.string().optional(),
});

const invoiceSchema = z.object({
  quotationId: z.string().optional().nullable(),
  customerId: z.string().min(1, "Customer is required"),
  date: z.string(),
  note: z.string().optional(),
  status: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

async function getNextInvoiceNumber(): Promise<string> {
  const last = await prisma.invoice.findFirst({
    orderBy: { invoiceNumber: "desc" },
  });
  if (!last) return "INV-00001";
  const num = parseInt(last.invoiceNumber.replace("INV-", ""), 10);
  return `INV-${String(num + 1).padStart(5, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { invoiceNumber: { contains: search } },
                  { customer: { name: { contains: search } } },
                  { customer: { mobile: { contains: search } } },
                ],
              }
            : {},
          status ? { status } : {},
          dateFrom ? { date: { gte: new Date(dateFrom) } } : {},
          dateTo ? { date: { lte: new Date(dateTo) } } : {},
        ],
      },
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
    });

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

    const invoiceNumber = await getNextInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        quotationId: data.quotationId || null,
        customerId: data.customerId,
        date: new Date(data.date),
        subtotal,
        discountTotal,
        grandTotal,
        note: data.note || null,
        status: data.status || "Unpaid",
        items: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            name: item.name,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.quantity * item.unitPrice - item.discount,
            warranty: item.warranty || null,
          })),
        },
      },
      include: { customer: true, items: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Invoices POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
