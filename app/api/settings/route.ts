import { db, docToJSON } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

const SETTINGS_ID = "app";

const defaultSettings = {
  businessName: "Zero Pos",
  themeColor: "#3b82f6",
  defaultQuotationNote:
    "We will visit your location and complete the full POS system setup. If any issue occurs after setup, our team can guide and support you remotely through AnyDesk, so there is no need to worry.",
  defaultInvoiceNote:
    "We will visit your location and complete the full POS system setup. If any issue occurs after setup, our team can guide and support you remotely through AnyDesk, so there is no need to worry.",
};

export async function GET() {
  try {
    const ref = doc(db, "settings", SETTINGS_ID);
    let snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...defaultSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      snap = await getDoc(ref);
    }
    return NextResponse.json(docToJSON(snap));
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id: _id, ...updateData } = body;
    const ref = doc(db, "settings", SETTINGS_ID);
    await setDoc(ref, { ...updateData, updatedAt: serverTimestamp() }, { merge: true });
    const snap = await getDoc(ref);
    return NextResponse.json(docToJSON(snap));
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
