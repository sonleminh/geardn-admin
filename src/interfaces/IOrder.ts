import { IProductSku } from "./IProductSku";

interface ISkuAttribute {
    attribute: string;
    value: string;
}

export interface IOrderItem {
    id: number;
    orderId: number;
    productId: number;
    skuId: number;
    quantity: number;
    sellingPrice: number;
    unitCost?: number;
    imageUrl: string;
    productName: string;
    productSlug: string;
    skuCode: string;
    skuAttributes: ISkuAttribute[];
    sku: IProductSku;
}

export interface IOrder {
    id: number;
    userId: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    shipment: {
        method: number;
        address: string;
        deliveryDate: Date;
    },
    paymentMethodId: number;
    paymentMethod: {
        id: number;
        name: string;
        image: string;
    };
    flag: {
        isOnlineOrder: boolean;
    };
    note: '';
    orderItems: IOrderItem[];
    orderCode: string;
    totalPrice: number;
    status: string;
    confirmedAt: Date;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICheckoutItem {
    productId: number;
    skuId: number;
    quantity: number;
    sellingPrice: number;
    // unitCost?: number;
    imageUrl: string;
    productName: string;
    // productSlug: string;
    // skuCode: string;
    skuAttributes: ISkuAttribute[];
}

export interface ICreateOrder extends Record<string, unknown>  {
    userId: number;
    fullName: string | null;
    phoneNumber: string | null;
    email: string | null;
    shipment: {
        method: number;
        address: string;
        deliveryDate: Date;
    };
    paymentMethodId: number;
    flag: {
        isOnlineOrder: boolean;
    };
    note: string | null;
    orderItems: {
        skuId: number;
        quantity: number;
    }[]
}
export interface IUpdateOrder{
    id: number;
    fullName: string | null;
    phoneNumber: string | null;
    email: string | null;
    shipment: {
        method: number;
        address: string;
        deliveryDate: Date | null;
    };
    paymentMethodId: number;
    flag: {
        isOnlineOrder: boolean;
    };
    note: string | null;
    orderItems: {
        skuId: number;
        quantity: number;
    }[]
}

export interface IUpdateOrderStatus{
    id: number;
    oldStatus: string;
    newStatus: string;
    note: string | null;
}

export interface IUpdateOrderConfirm{
    id: number;
    skuWarehouseMapping: {
        skuId: number;
        warehouseId: number;
    }[]
}

export interface ICancelOrder{
    id: number;
    oldStatus: string;
    cancelReasonCode: string;
    cancelReason: string | null;
}

export interface IUpdateDeliveryFailed{
    id: number;
    oldStatus: string;
    reasonCode: string;
    reasonNote: string | null;
}
export interface IProvince {
    name: string;
    code: number;
    division_type: string;
    codename: string;
    phone_code: number;
    districts: IDistrict[];
}
  
export interface IDistrict {
    name: string;
    code: number;
    division_type: string;
    codename: string;
    province_code: number;
    wards: IWards[];
}

export interface IWards {
    name: string;
    code: number;
    division_type: string;
    codename: string;
    short_codename: string;
}