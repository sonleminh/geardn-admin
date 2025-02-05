export interface IAttribute {
    id: number;
    type: string;
    value: string;
    createdAt: Date;
}

export interface ICreateAttribute extends Record<string, unknown>  {
    type: string;
    value: string;
}

export interface IUpdateAttributePayload {
    id: number;
    type: string;
    value: string;
}
  