import { IProductSkuAttribute } from "./IProductSkuAttribute";

export interface IProductSku {
    id: number;
    productId: number;
    sku: string;
    price: number;
    imageUrl: string;
    productSkuAttributes: IProductSkuAttribute[]
    createdAt: Date;
}

export interface ICreateProductSku extends Record<string, unknown>  {
    productId?: number;
    price: number;
    imageUrl: string | null;
    attributeValues: {
        attributeValueId: number
    }[];
}
export interface IUpdateProductSkuPayload {
    id: number;
    price: number;
    imageUrl: string | null;
    attributeValues: {
        attributeValueId: number
    }[];
}
  