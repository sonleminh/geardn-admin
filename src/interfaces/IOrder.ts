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
    price: number;
    costPrice?: number;
    imageUrl: string;
    productName: string;
    productSlug: string;
    skuCode: string;
    skuAttributes: ISkuAttribute[];
}

export interface IOrder {
    id: string;
    userId: string;
    items: IOrderItem[];
    customer: {
        name: string,
        phone: string,
        mail: string,
    },
    shipment: {
        method: number;
        address: string;
        deliveryDate: Date;
    },
    payment: {
        method: string;
    },
    note: '';
    totalAmount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateOrderItem {
    productId: number;
    skuId: number;
    quantity: number;
    price: number;
    costPrice?: number;
    imageUrl: string;
    productName: string;
    productSlug: string;
    skuCode: string;
    skuAttributes: ISkuAttribute[];
}

export interface ICreateOrder extends Record<string, unknown>  {
    name?: string;
    items: IOrderItem[]
}
export interface IUpdateOrder{
    id: number;
    name?: string;
    items: IOrderItem[]
}

export interface IUpdateOrderStatus{
    id: number;
    status: string;
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