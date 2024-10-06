export interface IAttribute {
    _id: string;
    name: string;
    value: string;
    createdAt: Date;
}

export interface ICreateAttribute extends Record<string, unknown>  {
    name: string;
    value: string;
}

export interface IUpdateAttributePayload {
    _id: string;
    name: string;
    value: string;
}
  