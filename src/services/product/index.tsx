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
  productList: IProduct[];
  categories: {
    _id: string;
    label: string;
  }[];
  total: number;
};

type TInitDataRes = {
  categories: { _id: string; name: string }[];
  tags: { value: string; label: string }[];
};

const productUrl = '/product';

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

const getProductByCategory = async (id: string) => {
  const result = await getRequest(`${productUrl}/category/${id}`);
  return result.data as IProduct[];
};

export const useGetProductByCategory = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.Product, id],
    queryFn: () => getProductByCategory(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
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

const uploadProductsFile = async (file: File) => {
  console.log(file);
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

const uploadImage = async (
  files: FileList,
  onProgress: (progress: number) => void
) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
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
  return result.data as { images: string[] };
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
      showNotification(
        error?.response?.data?.message || 'Upload failed',
        'error'
      );
    },
  });
};
