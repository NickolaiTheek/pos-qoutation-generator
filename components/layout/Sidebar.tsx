"use client";

import { cn } from "@/lib/utils";
import {
    FileText,
    LayoutDashboard,
    Package,
    PlusCircle,
    Receipt,
    Settings,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Create Quotation", href: "/quotations/new", icon: PlusCircle },
  { label: "Create Invoice", href: "/invoices/new", icon: PlusCircle },
  { label: "Quotations", href: "/quotations", icon: FileText },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Products", href: "/products", icon: Package },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-sm print:hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">ZP</span>
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">Zero Pos</p>
          <p className="text-xs text-gray-400 leading-tight">POS System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-blue-600" : "text-gray-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Zero Pos v1.0</p>
      </div>
    </aside>
  );
}
