import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional().default("General"),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  warranty: z.string().optional(),
});

const quotationSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  date: z.string(),
  note: z.string().optional(),
  status: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

async function getNextQuotationNumber(): Promise<string> {
  const last = await prisma.quotation.findFirst({
    orderBy: { quotationNumber: "desc" },
  });
  if (!last) return "QTN-00001";
  const num = parseInt(last.quotationNumber.replace("QTN-", ""), 10);
  return `QTN-${String(num + 1).padStart(5, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const quotations = await prisma.quotation.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { quotationNumber: { contains: search } },
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

    const subtotal = data.items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);
    const discountTotal = data.items.reduce((sum, item) => sum + item.discount, 0);
    const grandTotal = subtotal - discountTotal;

    const quotationNumber = await getNextQuotationNumber();

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: data.customerId,
        date: new Date(data.date),
        subtotal,
        discountTotal,
        grandTotal,
        note: data.note || null,
        status: data.status || "Draft",
        items: {
          create: data.items.map((item) => ({
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
        },
      },
      include: { customer: true, items: true },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Quotations POST error:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}
