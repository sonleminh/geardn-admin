import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

export interface IImportLogItem {
    id: number;
    importLogId: number;
    skuId: number;
    quantity: number;
    unitCost: number;
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
        unitCost: number;
    }[];
}

export interface IExportLogItem {
    id: number;
    exportLogId: number;
    skuId: number;
    quantity: number;
    unitCost: number;
    note?: string;
    sku: IProductSku;
}

export interface IExportLog {
    id: number;
    warehouseId: number;
    type: string;
    note?: string;
    createdBy: number;
    items: IExportLogItem[];
    createdAt: Date;

    warehouse: IWarehouse;
}


export interface ICreateExportLog extends Record<string, unknown>  {
    warehouseId: number;
    type: string;
    orderId?: number;
    note?: string;
    items: {
        skuId: number;
        quantity: number;
        unitCost: number;
    }[];
}

export interface IAdjustmentLogItem {
    id: number;
    adjustmentId: number;
    skuId: number;
    quantityBefore: number;
    quantityChange: number;
    unitCostBefore: number;
    sku: IProductSku;
}

export interface IAdjustmentLog {
    id: number;
    warehouseId: number;
    type: string;
    reason: string;
    note?: string;
    createdBy: number;
    warehouse: IWarehouse;
    items: IAdjustmentLogItem[];
    createdAt: Date;
}


export interface ICreateAdjustmentLog extends Record<string, unknown>  {
    warehouseId: number;
    type: string;
    reason: string;
    note?: string;
    items: {
        skuId: number;
        quantityBefore: number;
        quantityChange: number;
        unitCostBefore: number;
    }[];
}