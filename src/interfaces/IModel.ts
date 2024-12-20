export interface IModel {
    _id: string;
    product: string;
    name: string;
    price: number;
    stock: number;
    extinfo: {
        tier_index?: number[];
        is_pre_order: boolean;
    };
    createdAt: Date;
}

export interface ICreateModel extends Record<string, unknown>  {
    name?: string;
    price: number;
    stock: number;
    extinfo: {
        tier_index?: number[];
        is_pre_order: boolean;
    };
}
export interface IUpdateModel{
    _id: string;
    name?: string;
    price: number;
    stock: number;
    extinfo: {
        tier_index?: number[];
        is_pre_order: boolean;
    };
}
  