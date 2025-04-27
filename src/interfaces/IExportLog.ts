import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

interface IExportLogItem {
    id: number;
    exportLogId: number;
    skuId: number;
    quantity: number;
    costPrice: number;
    sku: IProductSku;
}

export interface IExportLog {
    id: number;
    warehouseId: number;
    type: string;
    reason: string;
    createdBy: number;
    warehouse: IWarehouse;
    items: IExportLogItem[];
}


export interface ICreateExportLog extends Record<string, unknown>  {
    warehouseId: number;
    type: string;
    note?: string;
    items: {
        skuId: number;
        quantity: number;
        costPrice: number;
    }[];
}