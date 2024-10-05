import { QueryKeys } from '@/constants/query-key';

import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import {
  ICreateProductSku,
  IProductSku,
  IUpdateProductSkuPayload,
} from '@/interfaces/IProductSku';

type TproductSkusRes = {
  productSkuList: IProductSku[];
  total: number;
};

const productSkuUrl = '/product-sku';

const getproductSkuList = async () => {
  const result = await getRequest(`${productSkuUrl}`);
  return result.data as TproductSkusRes;
};

export const useGetproductSkuList = () => {
  return useQuery({
    queryKey: [QueryKeys.ProductSku],
    queryFn: () => getproductSkuList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getproductSkuById = async (id: string) => {
  const result = await getRequest(`${productSkuUrl}/${id}`);
  return result.data as IProductSku;
};

export const useGetproductSkuById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.ProductSku, id],
    queryFn: () => getproductSkuById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createproductSku = async (payload: ICreateProductSku) => {
  const result = await postRequest(`${productSkuUrl}`, payload);
  return result.data as IProductSku;
};

export const useCreateproductSku = () => {
  return useMutation({
    mutationFn: createproductSku,
  });
};

// Update

const updateProductSku = async (payload: IUpdateProductSkuPayload) => {
  const { _id, ...rest } = payload;
  const result = await patchRequest(`${productSkuUrl}/${_id}`, rest);
  return result.data as IProductSku;
};

export const useUpdateProductSku = () => {
  return useMutation({
    mutationFn: updateProductSku,
  });
};

const deleteProductSku = async (id: string) => {
  const result = await deleteRequest(`${productSkuUrl}/${id}`);
  return result.data;
};

export const useDeleteproductSku = () => {
  return useMutation({
    mutationFn: deleteProductSku,
  });
};
