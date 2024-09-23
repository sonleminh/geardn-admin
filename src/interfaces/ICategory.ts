export interface ICategory {
    _id: string;
    value: string;
    label: string;
    createdAt: string;
}

export interface ICreateCategory extends Record<string, unknown>  {
    value: string;
    label: string;
}

export interface IUpdateCategoryPayload {
    _id: string;
    value: string;
    label: string;
}
  