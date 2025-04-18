import { IProductSku } from "./IProductSku";

export interface IStock {
    id: number;
    skuId: number;
    warehouseId: number;
    quantity: number;
    sku: IProductSku;
    createdAt: Date;
}