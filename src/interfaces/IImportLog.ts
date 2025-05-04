import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

export interface IImportLogItem {
    id: number;
    importLogId: number;
    skuId: number;
    quantity: number;
    costPrice: number;
    note?: string;
    sku: IProductSku;
}

export interface IImportLog {
    id: number;
    warehouseId: number;
    type: string;
    note?: string;
    createdBy: number;
    items: IImportLogItem[];
    createdAt: Date;

    warehouse: IWarehouse;
}


export interface ICreateImportLog extends Record<string, unknown>  {
    warehouseId: number;
    type: string;
    note?: string;
    items: {
        skuId: number;
        quantity: number;
        price: number;
    }[];
}