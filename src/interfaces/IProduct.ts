import { IProductSku } from "./IProductSku";

export interface ICategory {
    id: number;
    name: string
}

export interface ITagOptions {
    value: string;
    label: string;
}

interface IDetails {
    guarantee?: number | string;
    weight?: string;
    material?: string;
}

export interface IProduct {
    id: number;
    name: string;
    categoryId: number;
    category: ICategory;
    tags: ITagOptions[];
    images: string[];
    brand: string;
    details: IDetails;
    description: string;
    slug: string;
    skus: IProductSku[];
    totalStock: number;
    status:  'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
    isVisible: boolean;
    isDeleted: boolean;
    createdAt: string;
}

export interface ICreateProduct extends Record<string, unknown>  {
    name?: string;
    categoryId: number;
    tags: ITagOptions[];
    images?: string[];
    brand: string;
    details: IDetails;
    description?: string;
}

export interface IUpdateProductPayload {
    id: number;
    name?: string;
    categoryId: number;
    tags: ITagOptions[];
    images?: string[];
    brand: string;
    details: IDetails;
    description?: string;
}

export interface IUpdateProductIsVisiblePayload {
    id: number;
    isVisible: boolean;
}

export interface IProductPayload extends Record<string, unknown>  {
    name: string;
    tags: ITagOptions[];
    categoryId: number;
    images: string[];
    brand: string;
    details: IDetails;
    description: string;
  }