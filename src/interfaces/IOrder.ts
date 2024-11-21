export interface IOrderItem {
    model_id: string;
    name: string;
    image: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
}

export interface IOrder {
    _id: string;
    user: string;
    items: IOrderItem[];
    customer: {
        name: string,
        phone: string,
        mail: string,
    },
    shipment: {
        method: number;
        address: string;
        delivery_date: Date;
    },
    payment: {
        method: string;
    },
    note: '';
    total_amount: number;
    status: string;
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