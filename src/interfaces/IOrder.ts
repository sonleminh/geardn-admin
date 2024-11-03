export interface IOrderItem {
    model_id: string;
    name: string;
    image: string;
    price: number;
    extinfo: {
        tier_index: number[];
        is_pre_order: boolean;
    };
    product_id: string;
    product_name: string;
    quantity: number;
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