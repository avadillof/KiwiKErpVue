export interface ProductsDTO {

    pkid: number | null;

    code: string;

    description: string;

    barcode: string | null;

    active: boolean;

    dateUp: string | null;

    category: string;

    family: string;

    uom: string;

    salePrice: number;

    purchasePrice: number;

    sale: boolean;

    purchase: boolean;

}