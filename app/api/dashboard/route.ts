import { db, docsToJSON } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore/lite";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [quotationSnap, invoiceSnap, recentQuotationSnap, recentInvoiceSnap] = await Promise.all([
      getDocs(collection(db, "quotations")),
      getDocs(collection(db, "invoices")),
      getDocs(query(collection(db, "quotations"), orderBy("createdAt", "desc"), limit(5))),
      getDocs(query(collection(db, "invoices"), orderBy("createdAt", "desc"), limit(5))),
    ]);

    const totalQuotations = quotationSnap.size;
    const totalInvoices = invoiceSnap.size;
    const totalQuotationValue = quotationSnap.docs.reduce(
      (s, d) => s + ((d.data().grandTotal as number) ?? 0),
      0
    );
    const totalInvoiceValue = invoiceSnap.docs.reduce(
      (s, d) => s + ((d.data().grandTotal as number) ?? 0),
      0
    );
    const recentQuotations = docsToJSON(recentQuotationSnap.docs);
    const recentInvoices = docsToJSON(recentInvoiceSnap.docs);

    return NextResponse.json({
      totalQuotations,
      totalInvoices,
      totalQuotationValue,
      totalInvoiceValue,
      recentQuotations,
      recentInvoices,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
