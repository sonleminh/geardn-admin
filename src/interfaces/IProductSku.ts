export interface IProductSku {
    _id: string;
    product_id: string;
    product_name: string;
    product_sku: string;
    attributes: string[];
    sku: string;
    price: number;
    quantity: number;
    status: string;
    createdAt: Date;
}

export interface ICreateProductSku extends Record<string, unknown>  {
    product_id: string;
    product_name: string;
    product_sku: string;
    attributes: string[];
    sku: string;
    price: number;
    quantity: number;
    status: string;
}
export interface IUpdateProductSkuPayload {
    _id: string;
    product_id: string;
    product_name: string;
    product_sku: string;
    attributes: string[];
    sku: string;
    price: number;
    quantity: number;
    status: string;
}
  