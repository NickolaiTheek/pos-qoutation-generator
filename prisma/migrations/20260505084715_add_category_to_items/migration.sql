-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_invoice_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "warranty" TEXT,
    CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_invoice_items" ("description", "discount", "id", "invoiceId", "name", "productId", "quantity", "total", "unitPrice", "warranty") SELECT "description", "discount", "id", "invoiceId", "name", "productId", "quantity", "total", "unitPrice", "warranty" FROM "invoice_items";
DROP TABLE "invoice_items";
ALTER TABLE "new_invoice_items" RENAME TO "invoice_items";
CREATE TABLE "new_quotation_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "warranty" TEXT,
    CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "quotation_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_quotation_items" ("description", "discount", "id", "name", "productId", "quantity", "quotationId", "total", "unitPrice", "warranty") SELECT "description", "discount", "id", "name", "productId", "quantity", "quotationId", "total", "unitPrice", "warranty" FROM "quotation_items";
DROP TABLE "quotation_items";
ALTER TABLE "new_quotation_items" RENAME TO "quotation_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
