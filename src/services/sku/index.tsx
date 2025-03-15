import { QueryKeys } from '@/constants/query-key';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';

import {
  ICreateProductSku,
  IProductSku,
  IUpdateProductSkuPayload,
} from '@/interfaces/IProductSku';

type TSkusRes = {
  status: number;
  message: string;
  data: IProductSku[];
};

type TSkuRes = {
  status: number;
  message: string;
  data: IProductSku;
};

const productSkuUrl = '/product-skus';

const createSku = async (payload: ICreateProductSku) => {
  const result = await postRequest(`${productSkuUrl}`, payload);
  return result.data as IProductSku;
};

export const useCreateSku = () => {
  return useMutation({
    mutationFn: createSku,
  });
};

const getSkusByProductId = async (id: number) => {
  const result = await getRequest(`products/${id}/skus`);
  return result.data as TSkusRes;
};

export const useGetSkusByProductId = (id: number) => {
  return useQuery({
    queryKey: [QueryKeys.Sku, id],
    queryFn: () => getSkusByProductId(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getSkuByProductSku = async (sku: string) => {
  const result = await getRequest(`${productSkuUrl}/sku/${sku}`);
  return result.data as TSkuRes;
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
  const result = await patchRequest(`${productSkuUrl}/${id}`, rest);
  return result.data as IProductSku;
};

export const useUpdateSku = () => {
  return useMutation({
    mutationFn: updateSku,
  });
};

const deleteSku = async (id: number) => {
  const result = await deleteRequest(`${productSkuUrl}/${id}`);
  return result.data as IProductSku;
};

export const useDeleteSku = () => {
  return useMutation({
    mutationFn: deleteSku,
  });
};
