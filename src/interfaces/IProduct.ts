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

interface IDetails {
    guarantee?: number | string;
    weight?: string;
    material?: string;
}

export interface IProduct {
    _id: string;
    name: string;
    discount: IDiscount;
    category: ICategoryOptions;
    tags: ITagOptions[];
    images: string;
    attributes: string[];
    brand: string;
    details: IDetails;
    description: string;
    createdAt: string;
}

export interface ICreateProduct extends Record<string, unknown>  {
    name?: string;
    discount?: IDiscount;
    category?: ICategoryOptions;
    tags: ITagOptions[];
    images?: string[];
    brand: string;
    details: IDetails;
    description?: string;
    attributes: string[];
}

export interface IUpdateProductPayload {
    _id: string;
    name?: string;
    discount?: IDiscount;
    category?: ICategoryOptions;
    tags: ITagOptions[];
    images?: string[];
    brand: string;
    details: IDetails;
    description?: string;
    attributes?: string[];
}

export interface IProductPayload {
    name: string;
    discount?: {
      discountPrice: number;
      startDate: string;
      endDate: string;
    };
    tags: ITagOptions[];
    category?: ICategoryOptions;
    images: string[];
    brand: string;
    details: IDetails;
    description: string;
    attributes?: string[];  // Make 'attributes' optional
  }