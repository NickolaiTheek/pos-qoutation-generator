import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalQuotations,
      totalInvoices,
      quotationAgg,
      invoiceAgg,
      recentQuotations,
      recentInvoices,
    ] = await Promise.all([
      prisma.quotation.count(),
      prisma.invoice.count(),
      prisma.quotation.aggregate({ _sum: { grandTotal: true } }),
      prisma.invoice.aggregate({ _sum: { grandTotal: true } }),
      prisma.quotation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
    ]);

    return NextResponse.json({
      totalQuotations,
      totalInvoices,
      totalQuotationValue: quotationAgg._sum.grandTotal ?? 0,
      totalInvoiceValue: invoiceAgg._sum.grandTotal ?? 0,
      recentQuotations,
      recentInvoices,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
