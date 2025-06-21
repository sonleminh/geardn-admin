export interface IAttribute {
    id: number;
    name: string;
    label: string;
    createdAt: Date;
    isDeleted?: boolean;
}

export interface ICreateAttribute extends Record<string, unknown>  {
    name: string;
    label: string;
}

export interface IUpdateAttributePayload {
    id: number;
    name: string;
    label: string;
}
  