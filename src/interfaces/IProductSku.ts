import { IAttribute } from "./IAttribute";

export interface IProductSku {
    _id: string;
    productId: string;
    productName: string;
    attributes: IAttribute[];
    sku: string;
    price: number;
    quantity?: number;
    createdAt: Date;
}

export interface ICreateProductSku extends Record<string, unknown>  {
    productId: string;
    productName: string;
    attributes: IAttribute[];
    sku: string;
    price: number;
    quantity?: number;
}
export interface IUpdateProductSkuPayload {
    _id: string;
    productId: string;
    productName: string;
    attributes: IAttribute[];
    sku: string;
    price: number;
    quantity?: number;
}
  