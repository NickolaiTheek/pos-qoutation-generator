import { db, docsToJSON } from "@/lib/firebase";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore/lite";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PERSONS = ["Theekshana", "Praveen"] as const;

const cashInSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0),
  person: z.enum(PERSONS),
  description: z.string().optional(),
  date: z.string(),
});

export async function GET() {
  try {
    const snap = await getDocs(query(collection(db, "cash_ins"), orderBy("date", "desc")));
    return NextResponse.json(docsToJSON(snap.docs));
  } catch {
    return NextResponse.json({ error: "Failed to fetch cash ins" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = cashInSchema.parse(body);

    const ref = await addDoc(collection(db, "cash_ins"), {
      title: data.title,
      amount: data.amount,
      person: data.person,
      description: data.description || null,
      date: new Date(data.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { id: ref.id, title: data.title, amount: data.amount, person: data.person, description: data.description || null, date: data.date },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create cash in" }, { status: 500 });
  }
}
