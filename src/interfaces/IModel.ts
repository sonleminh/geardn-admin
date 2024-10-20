export interface IModel {
    _id: string;
    product_id: string;
    name: string;
    price: number;
    stock: number;
    createdAt: Date;
}

export interface ICreateModel extends Record<string, unknown>  {
    product_id: string;
    name: string;
    price: number;
    stock: number;
}
export interface IUpdateModel{
    _id: string;
    product_id: string;
    name: string;
    price: number;
    stock: number;
}
  