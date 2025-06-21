import { IAttribute } from "./IAttribute";

export interface IAttributeValue {
    id: number;
    attributeId: number;
    value: string;
    createdAt: Date;
    attribute: IAttribute;
    isDeleted?: boolean;
}

export interface ICreateAttributeValue extends Record<string, unknown>  {
    attributeId: number;
    value: string;
}

export interface IUpdateAttributeValuePayload {
    id: number;
    attributeId: number;
    value: string;
}
  