import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [expenseAgg, totalInvoiceValue, totalDebtAgg, totalDebtPaidAgg, expenseByCategory] = await Promise.all([
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.invoice.aggregate({ _sum: { grandTotal: true }, where: { status: "Paid" } }),
      prisma.debtRecord.aggregate({ _sum: { totalAmount: true } }),
      prisma.debtRecord.aggregate({ _sum: { paidAmount: true } }),
      prisma.expense.groupBy({ by: ["category"], _sum: { amount: true }, orderBy: { _sum: { amount: "desc" } } }),
    ]);

    return NextResponse.json({
      totalExpenses: expenseAgg._sum.amount ?? 0,
      totalRevenue: totalInvoiceValue._sum.grandTotal ?? 0,
      totalDebt: totalDebtAgg._sum.totalAmount ?? 0,
      totalDebtPaid: totalDebtPaidAgg._sum.paidAmount ?? 0,
      outstandingDebt: (totalDebtAgg._sum.totalAmount ?? 0) - (totalDebtPaidAgg._sum.paidAmount ?? 0),
      expenseByCategory: expenseByCategory.map(e => ({ category: e.category, total: e._sum.amount ?? 0 })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch business summary" }, { status: 500 });
  }
}
