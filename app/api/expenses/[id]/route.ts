import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = expenseSchema.parse(body);
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        date: new Date(data.date),
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(i => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
