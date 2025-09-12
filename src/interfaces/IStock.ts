import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

export interface IStock {
    id: number;
    skuId: number;
    warehouseId: number;
    quantity: number;
    unitCost: number;

    sku: IProductSku;
    warehouse: IWarehouse;
    createdAt: Date;
}

export interface IStockProductSkuItem extends IProductSku {
    quantity: number;
    unitCost: number;
}

export interface IStockItem {
    id: number;
    name: number;
    images: string[];
    totalStock: number;
    skus: IStockProductSkuItem[];
}