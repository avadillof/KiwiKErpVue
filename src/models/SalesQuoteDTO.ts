export interface SalesQuoteLineDTO {
    pkid: number | null;
    productId: number | null;
    productCode?: string;
    nameProduct: string;
    uomId: number | null;
    quantity: number;
    priceUnit: number;
    tax: number;
    discountPercent: number;
    incrementPercent: number;
}

export interface SalesQuoteDTO {
    pkid: number | null;
    type: 'P';
    code: string;
    state: string;
    createDate: string;
    validityDate: string | null;
    entityId: number | null;
    salesTermId: number | null;
    salesTarifaId: number | null;
    shippingAddressId: number | null;
    billingAddressId: number | null;
    shippingMethodId: number | null;
    reference: string;
    contact: string;
    terms: string;
    notes: string;
    lines: SalesQuoteLineDTO[];
}
