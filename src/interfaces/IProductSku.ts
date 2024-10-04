export interface IProductSku {
    _id: string;
    product_id: string;
    attribute_id: string;
    sku: string;
    price: number;
    quantity: number;
}

export interface ICreateProductSku extends Record<string, unknown>  {
    product_id: string;
    attribute_id: string;
    sku: string;
    price: number;
    quantity: number;
}
export interface IUpdateProductSkuPayload {
    _id: string;
    product_id: string;
    attribute_id: string;
    sku: string;
    price: number;
    quantity: number;
}
  