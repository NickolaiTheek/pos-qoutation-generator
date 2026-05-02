import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ClipboardList, FileText, TrendingUp, Wallet } from "lucide-react";

interface SummaryCardsProps {
  totalQuotations: number;
  totalInvoices: number;
  totalQuotationValue: number;
  totalInvoiceValue: number;
}

export default function SummaryCards({
  totalQuotations,
  totalInvoices,
  totalQuotationValue,
  totalInvoiceValue,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Quotations",
      value: totalQuotations.toString(),
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Invoices",
      value: totalInvoices.toString(),
      icon: ClipboardList,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Quotation Value",
      value: formatCurrency(totalQuotationValue),
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Invoice Value",
      value: formatCurrency(totalInvoiceValue),
      icon: Wallet,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
