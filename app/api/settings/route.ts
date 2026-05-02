import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          businessName: "Zero Pos",
          themeColor: "#3b82f6",
          defaultQuotationNote:
            "We will visit your location and complete the full POS system setup. If any issue occurs after setup, our team can guide and support you remotely through AnyDesk, so there is no need to worry.",
          defaultInvoiceNote:
            "We will visit your location and complete the full POS system setup. If any issue occurs after setup, our team can guide and support you remotely through AnyDesk, so there is no need to worry.",
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({ data: body });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: body,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
