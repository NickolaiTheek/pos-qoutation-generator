"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/quotations": "Quotations",
  "/quotations/new": "Create Quotation",
  "/invoices": "Invoices",
  "/invoices/new": "Create Invoice",
  "/customers": "Customers",
  "/products": "Products",
  "/settings": "Settings",
};

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith("/quotations/") && pathname.includes("/edit")) return "Edit Quotation";
    if (pathname.startsWith("/invoices/") && pathname.includes("/edit")) return "Edit Invoice";
    if (pathname.startsWith("/quotations/")) return "Quotation Details";
    if (pathname.startsWith("/invoices/")) return "Invoice Details";
    return "Zero Pos";
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 print:hidden">
      <div className="flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <button
          className="md:hidden p-1.5 rounded text-gray-500 hover:bg-gray-100"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-800">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-700 font-semibold text-xs">ZP</span>
        </div>
      </div>
    </header>
  );
}
