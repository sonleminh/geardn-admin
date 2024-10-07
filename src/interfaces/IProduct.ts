import { TYPE_ATTRIBUTE } from "@/constants/type-attribute";

export interface ICategoryOptions {
    _id: string;
    name: string
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
    discount: IDiscount;
    category: ICategoryOptions;
    tags: ITagOptions[];
    content: string;
    images: string;
    attributes: string[];
    createdAt: string;
}

export interface ICreateProduct extends Record<string, unknown>  {
    name?: string;
    discount?: IDiscount;
    category?: ICategoryOptions;
    tags: ITagOptions[];
    images?: string[];
    content?: string;
    attributes: string[];
}

export interface IUpdateProductPayload {
    _id: string;
    name?: string;
    discount?: IDiscount;
    category?: ICategoryOptions;
    tags: ITagOptions[];
    images?: string[];
    content?: string;
    attributes: string[];
}
  