import { prisma } from "@/lib/prisma";
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
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const debts = await prisma.debtRecord.findMany({
      where: {
        AND: [
          search ? { OR: [{ customerName: { contains: search } }, { customerMobile: { contains: search } }] } : {},
          status ? { status } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });
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

    const debt = await prisma.debtRecord.create({
      data: {
        customerName: data.customerName,
        customerMobile: data.customerMobile || null,
        description: data.description || null,
        totalAmount: data.totalAmount,
        paidAmount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(i => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create debt record" }, { status: 500 });
  }
}
