export interface ICategoryOptions {
    _id: string;
    value: string
    label: string;
}

export interface ITagOptions {
    value: string;
    label: string;
}

interface IDiscount {
    discountPrice?: number | string;
    startDate?: string;
    endDate?: string;
}

export interface IProduct {
    _id: string;
    name: string;
    price: number;
    discount: IDiscount;
    category: ICategoryOptions;
    tags: ITagOptions[];
    content: string;
    images: string;
    createdAt: string;
}

export interface ICreateProduct extends Record<string, unknown>  {
    name?: string;
    price?: number;
    discount?: IDiscount;
    category?: ICategoryOptions;
    tags: ITagOptions[];
    images?: string[];
    content?: string;
}

export interface IUpdateProductPayload {
    _id: string;
    name?: string;
    price?: number;
    discount?: IDiscount;
    category?: ICategoryOptions;
    tags: ITagOptions[];
    images?: string[];
    content?: string;
}
  