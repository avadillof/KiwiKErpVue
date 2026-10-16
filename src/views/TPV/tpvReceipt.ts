export interface TpvReceiptLine {
  productId?: number;
  code?: string;
  name?: string;
  quantity?: number;
  unitGross?: number;
  tax?: number;
  total?: number;
}

export interface TpvReceiptPayment {
  method?: string;
  amount?: number;
}

/** Recibo no fiscal devuelto por POST /WebTpv/checkout. */
export interface TpvReceipt {
  documentKind?: "PREBILL";
  chargeId?: number;
  code?: string;
  chargedAt?: string;
  chargedAtEpoch?: number;
  currency?: string;
  cashier?: string;
  zoneName?: string;
  registerName?: string;
  tableName?: string;
  companyName?: string;
  companyCif?: string;
  customerName?: string;
  customerNif?: string;
  fiscalCode?: string;
  qrUrl?: string;
  qrPng?: string;
  verifactuStatus?: string;
  net?: number;
  tax?: number;
  total?: number;
  paid?: number;
  change?: number;
  lines?: TpvReceiptLine[];
  payments?: TpvReceiptPayment[];
}

export interface CheckoutLine {
  savedLineId?: number;
  productId: number;
  quantity: number;
}

export interface TpvRefundLine {
  productId?: number;
  code?: string;
  name?: string;
  quantity?: number;
  unitGross?: number;
  tax?: number;
  total?: number;
}

/** Resguardo de devolución devuelto por POST /WebTpv/refund. */
export interface TpvRefund {
  refundId?: number;
  code?: string;
  chargeCode?: string;
  refundedAt?: string;
  currency?: string;
  cashier?: string;
  zoneName?: string;
  registerName?: string;
  companyName?: string;
  companyCif?: string;
  customerName?: string;
  customerNif?: string;
  total?: number;
  method?: string;
  reason?: string;
  lines?: TpvRefundLine[];
}

/** Ticket cobrado con cantidades ya devueltas (GET openings/{id}/charges). */
export interface TpvCharge {
  invoiceId?: number | null;
  invoiceCode?: string | null;
  invoiceState?: string | null;
  chargeId?: number;
  code?: string;
  chargedAt?: string;
  chargedAtEpoch?: number;
  currency?: string;
  cashier?: string;
  tableName?: string;
  customerName?: string;
  customerNif?: string;
  fiscalCode?: string;
  qrUrl?: string;
  qrPng?: string;
  verifactuStatus?: string;
  fiscalError?: string;
  net?: number;
  tax?: number;
  total?: number;
  paid?: number;
  change?: number;
  payments?: TpvReceiptPayment[];
  refundedTotal?: number;
  lines?: Array<
    TpvRefundLine & { refundedQty?: number; remainingQty?: number }
  >;
}
