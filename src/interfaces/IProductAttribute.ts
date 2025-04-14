import { IAttributeType } from "./IAttributeType";

export interface IProductAttribute {
    id: number;
    typeId: number;
    value: string;
    createdAt: Date;
    attributeType: IAttributeType;
}

export interface ICreateProductAttribute extends Record<string, unknown>  {
    typeId: number;
    value: string;
}

export interface IUpdateProductAttributePayload {
    id: number;
    typeId: number;
    value: string;
}
  