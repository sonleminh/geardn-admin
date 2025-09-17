import { IProduct } from "./IProduct";
import { IProductSkuAttribute } from "./IProductSkuAttribute";
import { IStock } from "./IStock";

export interface IProductSku {
    id: number;
    productId: number;
    sku: string;
    sellingPrice: number;
    imageUrl: string;
    productSkuAttributes: IProductSkuAttribute[]
    stocks: IStock[]
    product: IProduct;
    createdAt: Date;
    isDeleted: boolean;
}

export interface ICreateProductSku extends Record<string, unknown>  {
    productId?: number;
    sellingPrice: number;
    imageUrl: string | null;
    attributeValues: {
        attributeValueId: number
    }[];
}
export interface IUpdateProductSkuPayload {
    id: number;
    sellingPrice: number;
    imageUrl: string | null;
    attributeValues: {
        attributeValueId: number
    }[];
}
  