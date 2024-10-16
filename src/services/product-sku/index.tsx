import { QueryKeys } from '@/constants/query-key';

import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import { ICreateSku, IUpdateSkuPayload } from '@/interfaces/ISku';
import { ICategory } from '@/interfaces/ICategory';
import { IAttribute } from '@/interfaces/IAttribute';
import { IProductSku } from '@/interfaces/IProductSku';

type TProductSkusRes = {
  productSkuList: IProductSku[];
  total: number;
};

type TInitRes = {
  categoryList: ICategory[];
  productList: { _id: string; name: string; category: ICategory }[];
  attributeList: IAttribute[];
};

const productSkuUrl = '/product-sku';

const getProductSkuList = async () => {
  const result = await getRequest(`${productSkuUrl}`);
  return result.data as TProductSkusRes;
};

export const useGetProductSkuList = () => {
  return useQuery({
    queryKey: [QueryKeys.ProductSku],
    queryFn: () => getProductSkuList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getProductSkuById = async (id: string) => {
  const result = await getRequest(`${productSkuUrl}/${id}`);
  return result.data as IProductSku;
};

export const useGetProductSkuById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.ProductSku, id],
    queryFn: () => getProductSkuById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getSkuByProductId = async (id: string) => {
  const result = await getRequest(`${productSkuUrl}/product/${id}`);
  return result.data as IProductSku[];
};

export const useGetSkuByProductId = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.ProductSku, id],
    queryFn: () => getSkuByProductId(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getInitialForCreate = async () => {
  const result = await getRequest(`${productSkuUrl}/initial-for-create`);
  return result.data as TInitRes;
};

export const useGetInitialForCreate = () => {
  return useQuery({
    queryKey: [QueryKeys.ProductSku],
    queryFn: () => getInitialForCreate(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const createproductSku = async (payload: ICreateSku) => {
  const result = await postRequest(`${productSkuUrl}`, payload);
  return result.data as IProductSku;
};

export const useCreateproductSku = () => {
  return useMutation({
    mutationFn: createproductSku,
  });
};

// Update

const updateProductSku = async (payload: IUpdateSkuPayload) => {
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

export const useDeleteProductSku = () => {
  return useMutation({
    mutationFn: deleteProductSku,
  });
};
