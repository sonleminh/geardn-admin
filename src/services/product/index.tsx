import { useMutation, useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { AxiosError } from 'axios';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ICreateProduct,
  IProduct,
  IUpdateProductPayload,
} from '@/interfaces/IProduct';
import { ErrorResponse } from '@/interfaces/IError';
import { IQuery } from '@/interfaces/IQuery';
import { TBaseResponse, TPaginatedResponse } from '@/types/response.type';

interface IGetProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: string[];
  status?: string[];
  isDeleted?: string;
}

type TUploadImageResponse = {
  success: boolean;
  message: string;
  data: string[];
};

const productUrl = '/products';

const createProduct = async (payload: ICreateProduct) => {
  const result = await axiosInstance.post(`${productUrl}`, payload);
  return result.data as IProduct;
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: createProduct,
  });
};

const getProductList = async (query?: IGetProductListQuery) => {
  const result = await axiosInstance.get(`${productUrl}/admin`, {
    params: {
      page: query?.page ?? 0,
      limit: query?.limit ?? 10,
      search: query?.search,
      categoryIds: query?.categoryIds?.join(','),
      status: query?.status?.join(','),
      isDeleted: query?.isDeleted,
    },
  });
  return result.data as TPaginatedResponse<IProduct>;
};

export const useGetProductList = (query?: IGetProductListQuery) => {
  return useQuery({
    queryKey: [QueryKeys.Product, query],
    queryFn: () => getProductList(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getProductByCateId = async (id: number | undefined) => {
  const result = await axiosInstance.get(`${productUrl}/category/${id}`);
  return result.data as TPaginatedResponse<IProduct>;
};

export const useGetProductByCateId = (id: number | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.Product, 'category', id],
    queryFn: () => getProductByCateId(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getProductById = async (id: number) => {
  const result = await axiosInstance.get(`${productUrl}/${id}`);
  return result.data as TBaseResponse<IProduct>;
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
  const result = await axiosInstance.get(`${productUrl}/slug/${slug}`);
  return result.data as TBaseResponse<IProduct>;
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

  const result = await axiosInstance.post(`${productUrl}/upload`, formData, {
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
  const result = await axiosInstance.get(`${productUrl}/initial-to-create`);
  return result.data as TBaseResponse<IProduct>;
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
  const result = await axiosInstance.patch(`${productUrl}/${id}`, rest);
  return result.data as IProduct;
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: updateProduct,
  });
};

const deleteProduct = async (id: number) => {
  const result = await axiosInstance.patch(`${productUrl}/${id}`);
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
    formData.append('files', files[i]);
  }
  const result = await axiosInstance.post(`upload`, formData, {
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
