import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';

export interface PortalInvoice {
  pkid: number;
  code: string;
  date: string;
  reference?: string;
  net: number;
  tax: number;
  total: number;
  currency: string;
  collectedAmount: number;
  pendingAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  nextDueDate?: string | null;
  overdueAmount: number;
  pdfAvailable: boolean;
  facturaeAvailable: boolean;
  dues: Array<Record<string, any>>;
}

export interface PortalRectification {
  pkid: number;
  code: string;
  date: string;
  reference?: string;
  reason?: string;
  net: number;
  tax: number;
  total: number;
  currency: string;
  paid: boolean;
  invoiceCode?: string;
  sourceCode?: string;
  pdfAvailable: boolean;
}

export interface PortalBillingData {
  summary: { total: number; collected: number; pending: number; overdue: number; invoiceCount: number; rectificationCount: number };
  invoices: PortalInvoice[];
  rectifications: PortalRectification[];
}

export async function portalBilling(token: string): Promise<PortalBillingData> {
  const { data } = await axios.get(backendUrl('/WebPortalBilling'), { params: { token } });
  return data as PortalBillingData;
}

async function download(token: string, path: string, filename: string) {
  const { data } = await axios.get(backendUrl(path), { params: { token }, responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const downloadPortalInvoicePdf = (token: string, row: PortalInvoice) =>
  download(token, `/WebPortalInvoicePdf/${row.pkid}`, `${row.code}.pdf`);
export const downloadPortalInvoiceFacturae = (token: string, row: PortalInvoice) =>
  download(token, `/WebPortalInvoiceFacturae/${row.pkid}`, `FACTURAE_${row.code}.xml`);
export const downloadPortalRectificationPdf = (token: string, row: PortalRectification) =>
  download(token, `/WebPortalRectificationPdf/${row.pkid}`, `${row.code}.pdf`);

export async function requestPortalInvoiceCorrection(token: string, invoiceId: number, reason: string) {
  const { data } = await axios.post(backendUrl('/WebPortalInvoiceCorrectionRequest'), { token, invoiceId, reason });
  return data;
}
