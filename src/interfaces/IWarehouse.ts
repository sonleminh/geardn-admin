export interface IWarehouse {
    id: number;
    name: string;
    address: string;
    createdAt?: Date;
}

export interface ICreateWarehouse extends Record<string, unknown>  {
    name: string;
    address: string;
}

export interface IUpdateWarehousePayload {
    id: number;
    name: string;
    address?: string;
}
  