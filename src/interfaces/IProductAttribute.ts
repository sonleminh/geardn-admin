export interface IProductAttribute {
    id: number;
    type: string;
    value: string;
    createdAt: Date;
}

export interface ICreateProductAttribute extends Record<string, unknown>  {
    type: string;
    value: string;
}

export interface IUpdateProductAttributePayload {
    id: number;
    type: string;
    value: string;
}
  