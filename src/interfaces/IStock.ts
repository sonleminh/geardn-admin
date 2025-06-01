import { IProduct } from "./IProduct";
import { IProductSku } from "./IProductSku";
import { IWarehouse } from "./IWarehouse";

export interface IStock {
    id: number;
    skuId: number;
    warehouseId: number;
    quantity: number;
    costPrice: number;

    sku: IProductSku;
    warehouse: IWarehouse;
    createdAt: Date;
}

export interface IStockProductSkuItem extends IProductSku {
    quantity: number;
    costPrice: number;
}

export interface IStockByWarehouseItem {
    id: number;
    name: number;
    images: string[];
    totalStock: number;
    skus: IStockProductSkuItem[];
}

// interface IProductSkuWithStock extends IProductSku {
//     stocks: IStock[];
// }

// export interface IProductWithStock extends IProduct {
// skus: IProductSkuWithStock[];
// }