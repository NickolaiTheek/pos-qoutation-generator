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

const invoiceUpdateSchema = z.object({
  customerId: z.string().min(1).optional(),
  date: z.string().optional(),
  note: z.string().optional(),
  status: z.string().optional(),
  items: z.array(itemSchema).min(1).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = invoiceUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.customerId) updateData.customerId = data.customerId;
    if (data.date) updateData.date = new Date(data.date);
    if (data.note !== undefined) updateData.note = data.note || null;
    if (data.status) updateData.status = data.status;

    if (data.items) {
      const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const discountTotal = data.items.reduce((sum, item) => sum + item.discount, 0);
      updateData.subtotal = subtotal;
      updateData.discountTotal = discountTotal;
      updateData.grandTotal = subtotal - discountTotal;

      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      updateData.items = {
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
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData as Parameters<typeof prisma.invoice.update>[0]["data"],
      include: { customer: true, items: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
