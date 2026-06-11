import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return (
    "LKR " +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  );
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Converts an LKR amount to English words, e.g. 30000 → "Thirty Thousand Rupees Only". */
export function amountInWordsLKR(amount: number): string {
  if (!isFinite(amount) || amount < 0) return "";
  const rupees = Math.floor(amount);
  const cents = Math.round((amount - rupees) * 100);

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const below1000 = (n: number): string => {
    let str = "";
    if (n >= 100) { str += ones[Math.floor(n / 100)] + " Hundred"; n %= 100; if (n) str += " "; }
    if (n >= 20) { str += tens[Math.floor(n / 10)]; n %= 10; if (n) str += " " + ones[n]; }
    else if (n > 0) { str += ones[n]; }
    return str;
  };

  const toWords = (n: number): string => {
    if (n === 0) return "Zero";
    const scales: [string, number][] = [["Billion", 1e9], ["Million", 1e6], ["Thousand", 1e3]];
    let str = "";
    for (const [name, value] of scales) {
      if (n >= value) {
        str += below1000(Math.floor(n / value)) + " " + name + " ";
        n %= value;
      }
    }
    if (n > 0) str += below1000(n);
    return str.trim().replace(/\s+/g, " ");
  };

  let result = toWords(rupees) + " Rupee" + (rupees === 1 ? "" : "s");
  if (cents > 0) result += " and " + toWords(cents) + " Cent" + (cents === 1 ? "" : "s");
  return result + " Only";
}

export function generateQuotationNumber(count: number): string {
  return `QTN-${String(count).padStart(5, "0")}`;
}

export function generateInvoiceNumber(count: number): string {
  return `INV-${String(count).padStart(5, "0")}`;
}
