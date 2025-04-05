import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeys } from '@/constants/query-key';

import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ICreateProduct,
  IProduct,
  IUpdateProductPayload,
} from '@/interfaces/IProduct';
import { ErrorResponse } from '@/interfaces/IError';
import { IQuery } from '@/interfaces/IQuery';
import queryString from 'query-string';

type TProductsRes = {
  success: boolean;
  message: string;
  data: IProduct[];
  total: number;
};

type TProductRes = {
  status: number;
  message: string;
  data: IProduct;
};

type TInitDataRes = {
  success: boolean;
  message: string;
  data: {
    categories: { id: number; name: string }[];
    tags: { value: string; label: string }[];
  };
};

type TUploadImageResponse = {
  success: boolean;
  message: string;
  data: string[];
};

const productUrl = '/products';

const createProduct = async (payload: ICreateProduct) => {
  const result = await postRequest(`${productUrl}`, payload);
  return result.data as IProduct;
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: createProduct,
  });
};

const getProductList = async (query: IQuery) => {
  const newParams = { ...query, page: (query.page ?? 0) + 1 };
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

const getProductByCateId = async (id: number | undefined, query: IQuery) => {
  const newParams = { ...query, page: query.page ?? 1 };
  // const newParams = { ...query, page: (query.page ?? 0) + 1 };
  const queryParams = queryString.stringify(newParams ?? {});
  const result = await getRequest(
    `${productUrl}/admin/category/${id}?${queryParams}`
  );
  return result.data as { data: IProduct[]; total: number };
};

export const useGetProductByCateId = (
  id: number | undefined,
  query: IQuery
) => {
  return useQuery({
    queryKey: [QueryKeys.Product, id, query],
    queryFn: () => getProductByCateId(id, query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getProductById = async (id: number) => {
  const result = await getRequest(`${productUrl}/${id}`);
  return (result.data as TProductRes).data;
};

export const useGetProductById = (id: number) => {
  return useQuery({
    queryKey: [QueryKeys.Product, id],
    queryFn: () => getProductById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getProductBySlug = async (slug: string) => {
  const result = await getRequest(`${productUrl}/slug/${slug}`);
  return result.data as TProductRes;
};

export const useGetProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: [QueryKeys.Product, slug],
    queryFn: () => getProductBySlug(slug),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!slug,
  });
};

const uploadProductsFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const result = await postRequest(`${productUrl}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return result.data as IProduct;
};

export const useUploadProductsFile = () => {
  return useMutation({
    mutationFn: uploadProductsFile,
  });
};

const getProductInitial = async () => {
  const result = await getRequest(`${productUrl}/initial-to-create`);
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
  const { id, ...rest } = payload;
  const result = await patchRequest(`${productUrl}/${id}`, rest);
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

const deleteManyProduct = async (ids: number[]) => {
  const result = await deleteRequest(`${productUrl}`, { data: ids });
  return result.data;
};

export const useDeleteManyProduct = () => {
  return useMutation({
    mutationKey: [QueryKeys.Product],
    mutationFn: deleteManyProduct,
  });
};

const uploadImage = async (
  files: FileList,
  onProgress: (progress: number) => void
) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  const result = await postRequest(`upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (event.total) {
        const progress = Math.round((event.loaded * 100) / event.total);
        onProgress(progress);
      } else {
        onProgress(100);
      }
    },
  });
  return result.data as TUploadImageResponse;
};

export const useUploadImage = () => {
  const { showNotification } = useNotificationContext();
  return useMutation({
    mutationFn: ({
      files,
      onProgress,
    }: {
      files: FileList;
      onProgress: (progress: number) => void;
    }) => uploadImage(files, onProgress),
    onError(error: AxiosError<ErrorResponse>) {
      console.log('error', error);
      showNotification(
        error?.response?.data?.message || 'Upload failed',
        'error'
      );
    },
  });
};
