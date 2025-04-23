import { IProduct } from "./IProduct";
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

export interface IStockProductSkuItem extends IProductSku {
    quantity: number;
}

export interface IStockByWarehouseItem {
    productId: number;
    productName: number;
    productImages: string[];
    totalStock: number;
    skus: IStockProductSkuItem[];
}

interface IProductSkuWithStock extends IProductSku {
    stocks: IStock[];
}

export interface IProductWithStock extends IProduct {
skus: IProductSkuWithStock[];
}