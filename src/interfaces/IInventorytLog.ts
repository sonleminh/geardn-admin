import { IOrder } from "./IOrder";
import { IProductSku } from "./IProductSku";
import { IUser } from "./IUser";
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
    referenceCode: string;
    type: string;
    orderId?: number;
    note?: string;
    createdBy: number;
    items: IImportLogItem[];
    importDate: Date;
    createdAt: Date;

    warehouse: IWarehouse;
    order: IOrder;
    user: IUser;
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
    referenceCode: string;
    type: string;
    orderId?: number;
    note?: string;
    createdBy: number;
    items: IExportLogItem[];
    exportDate: Date;
    createdAt: Date;

    warehouse: IWarehouse;
    user: IUser;
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
    sku: IProductSku;
}

export interface IAdjustmentLog {
    id: number;
    referenceCode: string;
    warehouseId: number;
    type: string;
    reason: string;
    note?: string;
    createdBy: number;
    adjustmentDate: Date;
    createdAt: Date;

    warehouse: IWarehouse;
    items: IAdjustmentLogItem[];
    user: IUser;
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