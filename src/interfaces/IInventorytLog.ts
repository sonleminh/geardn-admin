import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

export interface IInventoryLogItem {
    id: number;
    importLogId: number;
    skuId: number;
    quantity: number;
    costPrice: number;
    note?: string;
    sku: IProductSku;
}

export interface IInventoryLog {
    id: number;
    warehouseId: number;
    type: string;
    note?: string;
    createdBy: number;
    items: IInventoryLogItem[];
    createdAt: Date;

    warehouse: IWarehouse;
}


export interface ICreateInventoryLog extends Record<string, unknown>  {
    warehouseId: number;
    type: string;
    note?: string;
    items: {
        skuId: number;
        quantity: number;
        costPrice: number;
    }[];
}