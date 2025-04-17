import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

export interface IImportLogItem {
    id: number;
    importLogId: number;
    skuId: number;
    quantity: number;
    price: number;
    note?: string;
    sku: IProductSku;
}

export interface IImportLog {
    id: number;
    warehouseId: number;
    note?: string;
    createdBy: number;
    warehouse: IWarehouse;
    items: IImportLogItem[];
}


export interface ICreateWarehouse extends Record<string, unknown>  {
    warehouseId: number;
    note?: string;
    items: IImportLogItem[];
}

export interface IUpdateWarehousePayload {
    warehouseId: number;
    note?: string;
    items: IImportLogItem[];
}
  