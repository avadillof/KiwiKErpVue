export interface SalesQuoteLineDTO {
    pkid: number | null;
    productId: number | null;
    productCode?: string;
    nameProduct: string;
    uomId: number | null;
    uomDescription?: string;
    uomFactor?: number;
    basePriceUnit?: number;
    quantity: number;
    priceUnit: number;
    tax: number;
    productTax?: number;
    discountPercent: number;
    incrementPercent: number;
    quantityPending?: number;
    quantityDelivered?: number;
    quantityCanceled?: number;
    quantityInvoiced?: number;
    requireDelivery?: boolean;
    invoicingPolicy?: 'ORDERED' | 'DELIVERED';
}

export interface SalesQuoteDTO {
    pkid: number | null;
    type: 'P' | 'S';
    code: string;
    state: string;
    locked?: boolean;
    createDate: string;
    validityDate: string | null;
    entityId: number | null;
    entityName?: string | null;
    salesTermId: number | null;
    salesTarifaId: number | null;
    currencySymbol?: string;
    currencyCode?: string;
    currencyDescription?: string;
    shippingAddressId: number | null;
    billingAddressId: number | null;
    retentionId: number | null;
    reference: string;
    contact: string;
    terms: string;
    customerTerms: string;
    notes: string;
    lines: SalesQuoteLineDTO[];
}
