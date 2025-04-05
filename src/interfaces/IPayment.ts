export interface IPayment {
    id: number;
    key: string;
    name: string;
    image: string;
    isDisabled: string;
    createdAt: Date;
}

export interface ICreatePayment extends Record<string, unknown>  {
    key: string;
    name: string;
    image: string;
    isDisabled: boolean;
}

export interface IUpdatePaymentPayload {
    id: number;
    key: string;
    name: string;
    image: string;
    isDisabled: boolean;
}