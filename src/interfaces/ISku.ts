export interface ISku {
    id: number;
    product_id: string;
    price: number;
    quantity: number;
    imageUrl: string;
    createdAt: Date;
}

export interface ICreateSku extends Record<string, unknown>  {
    productId: number;
    price: number;
    quantity: number;
    imageUrl: string;
    attributes: {
        attributeId: number
    }[];
}
export interface IUpdateSkuPayload {
    id: number;
    productId: number;
    price: number;
    quantity: number;
    imageUrl: string;
    attributes: {
        attributeId: number
    }[];
}
  