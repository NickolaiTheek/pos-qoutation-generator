export type Category = "Hardware" | "Software" | "Service" | "Support";
export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected";
export type InvoiceStatus = "Draft" | "Unpaid" | "Paid" | "Cancelled";

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  businessName?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  defaultPrice: number;
  warranty?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineItem {
  id?: string;
  productId?: string | null;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  warranty?: string;
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  productId?: string | null;
  name: string;
  description?: string | null;
  category?: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  warranty?: string | null;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  date: Date;
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  note?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  items?: QuotationItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId?: string | null;
  name: string;
  description?: string | null;
  category?: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  warranty?: string | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string | null;
  customerId: string;
  date: Date;
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  note?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  items?: InvoiceItem[];
}

export interface Settings {
  id: string;
  businessName: string;
  logoUrl?: string | null;
  themeColor: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  defaultQuotationNote?: string | null;
  defaultInvoiceNote?: string | null;
}

export interface DashboardStats {
  totalQuotations: number;
  totalInvoices: number;
  totalQuotationValue: number;
  totalInvoiceValue: number;
  recentQuotations: Quotation[];
  recentInvoices: Invoice[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  person: "Theekshana" | "Praveen";
  description?: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  mobile?: string | null;
  businessName?: string | null;
  address?: string | null;
  quotationAmount?: number | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtRecord {
  id: string;
  customerName: string;
  customerMobile?: string | null;
  description?: string | null;
  totalAmount: number;
  paidAmount: number;
  dueDate?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
