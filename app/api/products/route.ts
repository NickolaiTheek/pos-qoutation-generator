import { db, docsToJSON } from "@/lib/firebase";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore/lite";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(["Hardware", "Software", "Service", "Support"]),
  defaultPrice: z.number().min(0),
  warranty: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").toLowerCase();
    const activeOnly = searchParams.get("active") === "true";

    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    let products = docsToJSON(snap.docs);

    if (search) {
      products = products.filter((p) => (p.name as string).toLowerCase().includes(search));
    }
    if (activeOnly) {
      products = products.filter((p) => p.isActive === true);
    }

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const ref = await addDoc(collection(db, "products"), {
      name: data.name,
      description: data.description || null,
      category: data.category,
      defaultPrice: data.defaultPrice,
      warranty: data.warranty || null,
      isActive: data.isActive ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        id: ref.id,
        name: data.name,
        description: data.description || null,
        category: data.category,
        defaultPrice: data.defaultPrice,
        warranty: data.warranty || null,
        isActive: data.isActive ?? true,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
