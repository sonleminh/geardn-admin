export interface IPayment {
    _id: string;
    name: string;
    image: string;
    display_name: string;
    createdAt: Date;
}

export interface ICreatePayment extends Record<string, unknown>  {
    name: string;
    image: string;
    display_name: string;
}

export interface IUpdatePaymentPayload {
    _id: string;
    name: string;
    image: string;
    display_name: string;
}