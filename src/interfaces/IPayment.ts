export interface IPayment {
    _id: string;
    key: string;
    name: string;
    image: string;
    is_disabled: string;
    createdAt: Date;
}

export interface ICreatePayment extends Record<string, unknown>  {
    key: string;
    name: string;
    image: string;
    is_disabled: boolean;
}

export interface IUpdatePaymentPayload {
    _id: string;
    key: string;
    name: string;
    image: string;
    is_disabled: boolean;
}