export interface IAttribute {
    _id: string;
    type: string;
    value: string;
    createdAt: string;
}

export interface ICreateAttribute extends Record<string, unknown>  {
    type: string;
    value: string;
}

export interface IUpdateAttributePayload {
    _id: string;
    type: string;
    value: string;
}
  