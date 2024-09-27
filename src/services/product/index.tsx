import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFormData } from '@/utils/createFormdata';
import { QueryKeys } from '@/constants/query-key';
import { IQuery } from '@/interfaces/IQuery';
import queryString from 'query-string';
import {
  IProduct,
  ICreateProduct,
  IUpdateProductPayload,
} from '@/interfaces/IProduct';

type TProductsRes = {
  productList: IProduct[];
  categories: {
    _id: string;
    label: string;
  }[];
  total: number;
};

type TInitDataRes = {
  categories: { value: string; label: string }[];
  tags: { value: string; label: string }[];
};

const productUrl = '/product';

const getProductList = async (query: IQuery) => {
  const newParams = { ...query };
  const queryParams = queryString.stringify(newParams ?? {});
  const result = await getRequest(`${productUrl}?${queryParams}`);
  return result.data as TProductsRes;
};

export const useGetProductList = (query: IQuery) => {
  return useQuery({
    queryKey: [QueryKeys.Product, query],
    queryFn: () => getProductList(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getProductById = async (id: string) => {
  const result = await getRequest(`${productUrl}/${id}`);
  return result.data as IProduct;
};

export const useGetProductById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.Product, id],
    queryFn: () => getProductById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createProduct = async (payload: ICreateProduct) => {
  const result = await postRequest(`${productUrl}`, payload);
  return result.data as IProduct;
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: createProduct,
  });
};

const getProductInitial = async () => {
  const result = await getRequest(`${productUrl}/get-product-initial`);
  return result.data as TInitDataRes;
};

export const useGetProductInitial = () => {
  return useQuery({
    queryKey: [QueryKeys.Product],
    queryFn: () => getProductInitial(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

// Update

const updateProduct = async (payload: IUpdateProductPayload) => {
  const { _id, ...rest } = payload;
  const result = await patchRequest(`${productUrl}/${_id}`, rest);
  return result.data as IProduct;
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: updateProduct,
  });
};

const deleteProduct = async (id: string) => {
  const result = await deleteRequest(`${productUrl}/${id}`);
  return result.data;
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: deleteProduct,
  });
};

const uploadImage = async (files: FileList) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }
  const result = await postRequest(`upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return result.data as { images: string[] };
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadImage,
  });
};
