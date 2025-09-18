import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import {
  ICreateProductSku,
  IProductSku,
  IUpdateProductSkuPayload,
} from '@/interfaces/IProductSku';
import { TBaseResponse } from '@/types/response.type';

const productSkuUrl = '/product-skus';

const createSku = async (payload: ICreateProductSku) => {
  const result = await axiosInstance.post(`${productSkuUrl}`, payload);
  return result.data as IProductSku;
};

export const useCreateSku = () => {
  return useMutation({
    mutationFn: createSku,
  });
};

const getSkuById = async (id: number | undefined) => {
  const result = await axiosInstance.get(`${productSkuUrl}/${id}`);
  return result.data as TBaseResponse<IProductSku>;
};

export const useGetSkuById = (id: number | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.Sku, id],
    queryFn: () => getSkuById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getSkusByProductId = async (payload: {
  id: number | undefined;
  state?: 'active' | 'deleted' | 'all';
}) => {
  const result = await axiosInstance.get(`products/${payload.id}/skus`, {
    params: {
      state: payload.state,
    },
  });
  return result.data as TBaseResponse<IProductSku[]>;
};

export const useGetSkusByProductId = (payload: {
  id: number | undefined;
  state?: 'active' | 'deleted' | 'all';
}) => {
  return useQuery({
    queryKey: [QueryKeys.Sku, payload.id],
    queryFn: () => getSkusByProductId(payload),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!payload.id,
  });
};

const getSkuByProductSku = async (sku: string) => {
  const result = await axiosInstance.get(`${productSkuUrl}/${sku}`);
  return result.data as TBaseResponse<IProductSku>;
};

export const useGetSkuByProductSku = (sku: string) => {
  return useQuery({
    queryKey: [QueryKeys.Sku, sku],
    queryFn: () => getSkuByProductSku(sku),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!sku,
  });
};

const updateSku = async (payload: IUpdateProductSkuPayload) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${productSkuUrl}/${id}`, rest);
  return result.data as IProductSku;
};

export const useUpdateSku = () => {
  return useMutation({
    mutationFn: updateSku,
  });
};

const deleteSku = async (id: number) => {
  const result = await axiosInstance.delete(`${productSkuUrl}/${id}`);
  return result.data as IProductSku;
};

export const useDeleteSku = () => {
  return useMutation({
    mutationFn: deleteSku,
  });
};

const restoreSku = async (id: number) => {
  const result = await axiosInstance.patch(`${productSkuUrl}/${id}/restore`);
  return result.data;
};

export const useRestoreSku = () => {
  return useMutation({
    mutationFn: restoreSku,
  });
};

const deleteSkuPermanent = async (id: number) => {
  const result = await axiosInstance.delete(`${productSkuUrl}/${id}/permanent`);
  return result.data;
};

export const useDeleteSkuPermanent = () => {
  return useMutation({
    mutationFn: deleteSkuPermanent,
  });
};
