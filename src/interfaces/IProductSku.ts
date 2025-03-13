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
    productid: number;
    sku: string;
    price: number;
    quantity: number;
    imageUrl: string;
    productSkuAttributes: {
        id: number;
        attribute: IProductSkuAttribute
    }[]
    createdAt: Date;
}

export interface ICreateProductSku extends Record<string, unknown>  {
    productId: number;
    price: number;
    quantity: number;
    imageUrl: string;
    attributes: {
        attributeId: number
    }[];
}
export interface IUpdateProductSkuPayload {
    id: number;
    productId: number;
    price: number;
    quantity: number;
    imageUrl: string;
    attributes: {
        attributeId: number
    }[];
}
  