export interface ProductDTO {
  productProductPkId: number;
  productProductDsCode: string;
  productProductDsDescriptionSp: string;
}

export interface PageResponse {
  content: ProductDTO[];
  totalElements: number;
}