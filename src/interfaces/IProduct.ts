import { IModel } from "./IModel";
import { IVariant } from "./IVariant";

export interface ICategory {
    id: number;
    name: string
}

export interface ITagOptions {
    value: string;
    label: string;
}

// interface IDiscount {
//     discountPrice?: number | string;
//     startDate?: string;
//     endDate?: string;
// }

interface IDetails {
    guarantee?: number | string;
    weight?: string;
    material?: string;
}

export interface IProduct {
    id: number;
    name: string;
    // discount?: IDiscount;
    categoryId: number;
    category: ICategory;
    tags: ITagOptions[];
    images: string[];
    tier_variations: IVariant[]
    models: IModel[];
    // attributes: string[];
    sku_name: string;
    brand: string;
    details: IDetails;
    original_price: number;
    description: string;
    createdAt: string;
}

export interface ICreateProduct extends Record<string, unknown>  {
    name?: string;
    // discount?: IDiscount;
    categoryId: number;
    tags: ITagOptions[];
    images?: string[];
    brand: string;
    // attributes?: string[];
    sku_name: string;
    details: IDetails;
    description?: string;
}

export interface IUpdateProductPayload {
    id: number;
    name?: string;
    // discount?: IDiscount;
    categoryId: number;
    tags: ITagOptions[];
    images?: string[];
    // attributes?: string[];
    sku_name: string;
    brand: string;
    details: IDetails;
    description?: string;
}

export interface IProductPayload extends Record<string, unknown>  {
    name: string;
    // discount?: {
    //   discountPrice: number;
    //   startDate: string;
    //   endDate: string;
    // };
    tags: ITagOptions[];
    categoryId: number;
    images: string[];
    sku_name: string;
    brand: string;
    // attributes?: string[];  
    // sku_name: string;
    details: IDetails;
    description: string;
  }