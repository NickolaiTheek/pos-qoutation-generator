import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const leads = await prisma.lead.findMany({
      where: {
        AND: [
          search ? { OR: [{ name: { contains: search } }, { businessName: { contains: search } }, { mobile: { contains: search } }] } : {},
          status ? { status } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = leadSchema.parse(body);
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        mobile: data.mobile || null,
        businessName: data.businessName || null,
        address: data.address || null,
        notes: data.notes || null,
        status: data.status || "New",
      },
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(i => i.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
