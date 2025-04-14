import { useMutation, useQuery } from '@tanstack/react-query';

import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';

import { QueryKeys } from '@/constants/query-key';
import {
  IProductAttribute,
  ICreateProductAttribute,
  IUpdateProductAttributePayload,
} from '@/interfaces/IProductAttribute';

type TProductAttributeListRes = {
  status: number;
  message: string;
  data: IProductAttribute[];
  total: number;
};

type TProductAttributeListByTypeRes = {
  data: IProductAttribute[];
  status: number;
  message: string;
};

type TProductAttributeRes = {
  data: IProductAttribute;
  status: number;
  message: string;
};

const attributeUrl = '/product-attributes';

const createAttribute = async (payload: ICreateProductAttribute) => {
  const result = await postRequest(`${attributeUrl}`, payload);
  return result.data as IProductAttribute;
};

export const useCreateProductAttribute = () => {
  return useMutation({
    mutationFn: createAttribute,
  });
};

const getProductAttributeById = async (id: number) => {
  const result = await getRequest(`${attributeUrl}/${id}`);
  return result.data as TProductAttributeRes;
};

export const useGetProductAttributeById = (id: number) => {
  return useQuery({
    queryKey: [QueryKeys.ProductAttribute, id],
    queryFn: () => getProductAttributeById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getProductAttributesByType = async (typeId: number | undefined) => {
  const result = await getRequest(`product-attributes/type/${typeId}`);
  return result.data as TProductAttributeListByTypeRes;
};

export const useGetProductAttributesByType = (typeId: number | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.Product, typeId],
    queryFn: () => getProductAttributesByType(typeId),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!typeId,
  });
};

const getProductAttributeList = async () => {
  const result = await getRequest(`product-attributes`);
  return result.data as TProductAttributeListRes;
};

export const useGetProductAttributeList = () => {
  return useQuery({
    queryKey: [QueryKeys.ProductAttribute],
    queryFn: () => getProductAttributeList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

// Update

const updateProductAttribute = async (
  payload: IUpdateProductAttributePayload
) => {
  const { id, ...rest } = payload;
  const result = await patchRequest(`${attributeUrl}/${id}`, rest);
  return result.data as IProductAttribute;
};

export const useUpdateProductAttribute = () => {
  return useMutation({
    mutationFn: updateProductAttribute,
  });
};

const deleteProductAttribute = async (id: number) => {
  const result = await deleteRequest(`${attributeUrl}/${id}`);
  return result.data;
};

export const useDeleteProductAttribute = () => {
  return useMutation({
    mutationFn: deleteProductAttribute,
  });
};
