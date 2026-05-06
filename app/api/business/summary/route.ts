import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [expenseSnap, invoiceSnap, debtSnap] = await Promise.all([
      getDocs(collection(db, "expenses")),
      getDocs(query(collection(db, "invoices"), where("status", "==", "Paid"))),
      getDocs(collection(db, "debt_records")),
    ]);

    const totalExpenses = expenseSnap.docs.reduce(
      (s, d) => s + ((d.data().amount as number) ?? 0),
      0
    );
    const totalRevenue = invoiceSnap.docs.reduce(
      (s, d) => s + ((d.data().grandTotal as number) ?? 0),
      0
    );
    const debtDocs = debtSnap.docs.map((d) => d.data());
    const totalDebt = debtDocs.reduce((s, d) => s + ((d.totalAmount as number) ?? 0), 0);
    const totalDebtPaid = debtDocs.reduce((s, d) => s + ((d.paidAmount as number) ?? 0), 0);
    const outstandingDebt = totalDebt - totalDebtPaid;

    const categoryMap: Record<string, number> = {};
    for (const d of expenseSnap.docs) {
      const { category, amount } = d.data() as { category: string; amount: number };
      categoryMap[category] = (categoryMap[category] ?? 0) + amount;
    }
    const expenseByCategory = Object.entries(categoryMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      totalExpenses,
      totalRevenue,
      totalDebt,
      totalDebtPaid,
      outstandingDebt,
      expenseByCategory,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch business summary" }, { status: 500 });
  }
}
