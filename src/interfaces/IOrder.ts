export interface IOrderItem {
    model_id: string;
    product_id: string;
    product_name: string;
    // category_id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
}

export interface IOrder {
    _id: string;
    user_id: string;
    name: string;
    phone: string;
    email: string;
    items: IOrderItem[]
    total_amount: number;
    status: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
    receive_option: string;
    createdAt: Date;
}

export interface ICreateOrder extends Record<string, unknown>  {
    name?: string;
    items: IOrderItem[]
}
export interface IUpdateOrder{
    _id: string;
    name?: string;
    items: IOrderItem[]
}

export interface IUpdateOrderStatus{
    _id: string;
    status: string;
}