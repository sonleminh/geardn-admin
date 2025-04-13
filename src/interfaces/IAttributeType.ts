export interface IAttributeType {
    id: number;
    name: string;
    label: string;
    createdAt: Date;
}

export interface ICreateAttributeType extends Record<string, unknown>  {
    name: string;
    label: string;
}

export interface IUpdateAttributeTypePayload {
    id: number;
    name: string;
    label: string;
}
  