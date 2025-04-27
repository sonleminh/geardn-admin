import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

interface IAdjustmentItem {
    id: number;
    adjustmentId: number;
    skuId: number;
    quantityBefore: number;
    quantityChange: number;
    costPriceBefore: number;
    sku: IProductSku;
}

export interface IAdjustmentLog {
    id: number;
    warehouseId: number;
    type: string;
    reason: string;
    createdBy: number;
    warehouse: IWarehouse;
    items: IAdjustmentItem[];
}


export interface ICreateAdjustmentLog extends Record<string, unknown>  {
    warehouseId: number;
    type: string;
    reason: string;
    items: {
        skuId: number;
        quantityBefore: number;
        quantityChange: number;
        costPriceBefore: number;
    }[];
}