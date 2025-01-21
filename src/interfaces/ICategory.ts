export interface ICategory {
    id: number;
    name: string;
    icon: string;
    slug?: string;
    createdAt?: Date;
}

export interface ICreateCategory extends Record<string, unknown>  {
    name: string;
    icon: string;
    slug?: string;
}

export interface IUpdateCategoryPayload {
    id: number;
    name: string;
    icon: string;
    slug?: string;
}
  