export interface ISku {
    _id: string;
    product_id: string;
    product_name: string;
    attributes: string[];
    sku: string;
    price: number;
    quantity: number;
    status: string;
    createdAt: Date;
}

export interface ICreateSku extends Record<string, unknown>  {
    product_id: string;
    product_name?: string;
    attributes: string[];
    sku: string;
    price: number;
    quantity: number;
    status?: string;
}
export interface IUpdateSkuPayload {
    _id: string;
    product_id: string;
    product_name?: string;
    attributes: string[];
    sku: string;
    price: number;
    quantity: number;
    status?: string;
}
  