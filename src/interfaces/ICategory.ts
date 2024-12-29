export interface ICategory {
    _id: string;
    name: string;
    icon: string;
    createdAt?: Date;
}

export interface ICreateCategory extends Record<string, unknown>  {
    name: string;
    icon: string;
}

export interface IUpdateCategoryPayload {
    _id: string;
    name: string;
    icon: string;
}
  