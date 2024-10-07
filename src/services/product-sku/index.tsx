import { QueryKeys } from '@/constants/query-key';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import {
  ICreateProductSku,
  IProductSku,
  IUpdateProductSkuPayload,
} from '@/interfaces/IProductSku';
import { ICategory } from '@/interfaces/ICategory';
import { IAttribute } from '@/interfaces/IAttribute';

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

const createproductSku = async (payload: any) => {
  const result = await postRequest(`${productSkuUrl}`, payload);
  return result.data as IProductSku;
};

export const useCreateproductSku = () => {
  return useMutation({
    mutationFn: createproductSku,
  });
};

// Update

const updateProductSku = async (payload: any) => {
  const { _id, ...rest } = payload;
  const result = await patchRequest(`${productSkuUrl}/${_id}`, rest);
  return result.data as IProductSku;
};

export const useUpdateProductSku = () => {
  const queryClient = useQueryClient();
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
