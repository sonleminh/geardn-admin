import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

export interface IStock {
    id: number;
    skuId: number;
    warehouseId: number;
    quantity: number;
    sku: IProductSku;
    warehouse: IWarehouse;
    createdAt: Date;
}