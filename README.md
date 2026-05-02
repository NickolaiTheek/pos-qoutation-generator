# Zero Pos — POS Invoice Generator

A professional web application for generating Price Quotations and Invoices for POS system sales businesses.

## Features

- Price Quotations (QTN-00001) and Invoices (INV-00001) with auto-numbering
- PDF download and print support
- Customer Management, Product Management, Dashboard, Settings
- Convert Quotation → Invoice in one click
- LKR currency formatting
- 7 default products preloaded

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma 7 + SQLite via @prisma/adapter-libsql
- Tailwind CSS v4
- react-hook-form + Zod validation
- jsPDF + html2canvas for PDF generation

## Installation

```bash
npm install
npx prisma migrate dev --name init
npx ts-node --esm prisma/seed.ts
npm run dev
```

Open http://localhost:3000

## Production Build

```bash
npm run build
npm start
```

## Default Products (Seeded)

1. Full Functional Desktop Machine — Hardware
2. POS System Software — Software
3. 1D/2D Barcode Scanner — Hardware (One Year Warranty)
4. Label/Receipt Printer 2-in-1 XP-365B — Hardware (One Year Warranty)
5. Cash Drawer — Hardware (4 Bill 8 Coin)
6. Installation and Setup Service — Service
7. Remote Support via AnyDesk — Support

## PDF Generation

Open any Quotation or Invoice detail page and click "Download PDF".
Files are saved as: Zero-Pos-Quotation-QTN-00001.pdf / Zero-Pos-Invoice-INV-00001.pdf

## Print

Click "Print" on any detail page. Sidebar and action buttons are hidden automatically.
