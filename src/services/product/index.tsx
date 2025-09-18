import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import { useAlertContext } from '@/contexts/AlertContext';
import {
  ICreateProduct,
  IProduct,
  IUpdateProductIsVisiblePayload,
  IUpdateProductPayload,
} from '@/interfaces/IProduct';
import { ErrorResponse } from '@/interfaces/IError';
import { TBaseResponse, TPaginatedResponse } from '@/types/response.type';

interface IGetProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: string[];
  statuses?: string[];
  isDeleted?: string;
}

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
      statuses: query?.statuses?.join(','),
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
  return result.data as TBaseResponse<IProduct>;
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: updateProduct,
  });
};

const updateProductIsVisible = async (
  payload: IUpdateProductIsVisiblePayload
) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(
    `${productUrl}/${id}/is-visible`,
    rest
  );
  return result.data as TBaseResponse<IProduct>;
};

export const useUpdateProductIsVisible = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProductIsVisible,
    onMutate: async (payload: IUpdateProductIsVisiblePayload) => {
      queryClient.cancelQueries({ queryKey: [QueryKeys.Product] });

      const allProductQueries = queryClient.getQueriesData({
        queryKey: [QueryKeys.Product],
      });

      const prevData = allProductQueries.map(([queryKey, data]) => [
        queryKey,
        data ? JSON.parse(JSON.stringify(data)) : data, // Deep clone
      ]);

      allProductQueries.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(
            queryKey,
            (old: TPaginatedResponse<IProduct> | undefined) => {
              if (!old) return old;
              const items = old.data.map((it: IProduct) => {
                if (it.id === payload.id) {
                  return { ...it, isVisible: payload.isVisible };
                }
                return it;
              });
              return { ...old, data: items };
            }
          );
        }
      });
      return { prevData };
    },
    onError: (_err, _payload, ctx) => {
      if (!ctx?.prevData) return;
      // Rollback all affected queries to their previous values
      (ctx.prevData as Array<[unknown, unknown]>).forEach(
        ([queryKey, data]) => {
          queryClient.setQueryData(queryKey as any, data);
        }
      );
    },
    onSettled: () => {
      // Ensure server state sync after success or error
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Product] });
    },
  });
};

const deleteProduct = async (id: number) => {
  const result = await axiosInstance.delete(`${productUrl}/${id}`);
  return result.data;
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: deleteProduct,
  });
};

const restoreProduct = async (id: number) => {
  const result = await axiosInstance.patch(`${productUrl}/${id}/restore`);
  return result.data;
};

export const useRestoreProduct = () => {
  return useMutation({
    mutationFn: restoreProduct,
  });
};

const deleteProductPermanent = async (id: number) => {
  const result = await axiosInstance.delete(`${productUrl}/${id}/permanent`);
  return result.data;
};

export const useDeleteProductPermanent = () => {
  return useMutation({
    mutationFn: deleteProductPermanent,
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
  return result.data as TBaseResponse<string[]>;
};

export const useUploadImage = () => {
  const { showAlert } = useAlertContext();
  return useMutation({
    mutationFn: ({
      files,
      onProgress,
    }: {
      files: FileList;
      onProgress: (progress: number) => void;
    }) => uploadImage(files, onProgress),
    onError(error: AxiosError<ErrorResponse>) {
      showAlert(error?.response?.data?.message || 'Upload failed', 'error');
    },
  });
};
