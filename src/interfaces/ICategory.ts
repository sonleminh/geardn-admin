export interface ICategory {
    _id: string;
    name: string;
    createdAt?: Date;
}

export interface ICreateCategory extends Record<string, unknown>  {
    name: string;
}

export interface IUpdateCategoryPayload {
    _id: string;
    name: string;
}
  