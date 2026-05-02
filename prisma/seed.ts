import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultNote =
    "We will visit your location and complete the full POS system setup. If any issue occurs after setup, our team can guide and support you remotely through AnyDesk, so there is no need to worry.";

  // Upsert settings
  const existing = await prisma.settings.findFirst();
  if (!existing) {
    await prisma.settings.create({
      data: {
        businessName: "Zero Pos",
        phone: "",
        email: "",
        address: "",
        defaultQuotationNote: defaultNote,
        defaultInvoiceNote: defaultNote,
      },
    });
    console.log("Settings created.");
  }

  const products = [
    {
      name: "Full Functional Desktop Machine",
      category: "Hardware",
      defaultPrice: 0,
      description: "Including Monitor, Mouse, and Keyboard",
      warranty: null,
      isActive: true,
    },
    {
      name: "POS System Software",
      category: "Software",
      defaultPrice: 0,
      description: null,
      warranty: null,
      isActive: true,
    },
    {
      name: "1D/2D Barcode Scanner",
      category: "Hardware",
      defaultPrice: 0,
      description: null,
      warranty: "One Year Warranty",
      isActive: true,
    },
    {
      name: "Label/Receipt Printer 2-in-1 XP-365B",
      category: "Hardware",
      defaultPrice: 0,
      description: null,
      warranty: "One Year Warranty",
      isActive: true,
    },
    {
      name: "Cash Drawer",
      category: "Hardware",
      defaultPrice: 0,
      description: "4 Bill 8 Coin",
      warranty: null,
      isActive: true,
    },
    {
      name: "Installation and Setup Service",
      category: "Service",
      defaultPrice: 0,
      description: null,
      warranty: null,
      isActive: true,
    },
    {
      name: "Remote Support via AnyDesk",
      category: "Support",
      defaultPrice: 0,
      description: null,
      warranty: null,
      isActive: true,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: product });
      console.log(`Product created: ${product.name}`);
    } else {
      console.log(`Product already exists: ${product.name}`);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
