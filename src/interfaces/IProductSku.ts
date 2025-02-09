export interface IProductSkuAttribute {
    id: number;
    attribute: {
        id: number;
        type: string;
        value: string;
    };
}

export interface IProductSku {
    id: number;
    productId: string;
    imageUrl: string;
    sku: string;
    price: number;
    quantity: number;
    createdAt: Date;
    productSkuAttributes: IProductSkuAttribute[]
    product: {
        id: number;
        name: string;
    }
}

export interface ICreateProductSku extends Record<string, unknown>  {
    productId: string;
    imageUrl: string;
    sku: string;
    price: number;
    quantity: number;
}
export interface IUpdateProductSkuPayload {
    id: number;
    productId: string;
    imageUrl: string;
    sku: string;
    price: number;
    quantity: number;
}
  