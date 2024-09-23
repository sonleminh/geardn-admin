export interface ICategoryOptions {
    _id: string;
    label: string;
}

export interface ITagOptions {
    value: string;
    label: string;
}

export interface IProduct {
    _id: string;
    name: string;
    category_id: string;
    tags: ITagOptions[];
    content: string;
    thumbnail_image: string;
    createdAt: string;
}

export interface ICreateProduct extends Record<string, unknown>  {
    name: string;
    category_id: string;
    tags: ITagOptions[];
    content: string;
}

export interface IUpdateProductPayload {
    _id: string;
    name: string;
    category_id: string;
    tags: ITagOptions[];
    thumbnail_image?: File;
    content: string;
}
  