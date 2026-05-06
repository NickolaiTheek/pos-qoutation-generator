import { db, docsToJSON } from "@/lib/firebase";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore/lite";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? "";

    const snap = await getDocs(query(collection(db, "expenses"), orderBy("date", "desc")));
    let expenses = docsToJSON(snap.docs);

    if (category) expenses = expenses.filter((e) => e.category === category);

    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = expenseSchema.parse(body);

    const ref = await addDoc(collection(db, "expenses"), {
      title: data.title,
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      date: new Date(data.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        id: ref.id,
        title: data.title,
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        date: data.date,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
