export interface ICategoryOptions {
    _id: string;
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
    category_id: string;
    tags: ITagOptions[];
    content: string;
    thumbnail_image: string;
    createdAt: string;
}

export interface ICreateProduct extends Record<string, unknown>  {
    name?: string;
    price?: number;
    discount?: IDiscount;
    category_id: string;
    tags: ITagOptions[];
    content?: string;
}

export interface IUpdateProductPayload {
    _id: string;
    name?: string;
    price?: number;
    discount?: IDiscount;
    category_id: string;
    tags: ITagOptions[];
    thumbnail_image?: File;
    content?: string;
}
  