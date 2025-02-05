import { QueryKeys } from '@/constants/query-key';
import {
  IAttribute,
  ICreateAttribute,
  IUpdateAttributePayload,
} from '@/interfaces/IAttribute';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';

type TAttributeListRes = {
  product_attributes: IAttribute[];
  total: number;
};

type TAttributeRes = {
  data: IAttribute;
  status: number;
  message: string;
};

const attributeUrl = '/product-attributes';

const getAttributeList = async () => {
  const result = await getRequest(`${attributeUrl}`);
  return result.data as TAttributeListRes;
};

export const useGetAttributeList = () => {
  return useQuery({
    queryKey: [QueryKeys.Attribute],
    queryFn: () => getAttributeList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getAttributeById = async (id: string) => {
  const result = await getRequest(`${attributeUrl}/${id}`);
  return (result.data as TAttributeRes).data;
};

export const useGetAttributeById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.Attribute, id],
    queryFn: () => getAttributeById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createAttribute = async (payload: ICreateAttribute) => {
  const result = await postRequest(`${attributeUrl}`, payload);
  return result.data as IAttribute;
};

export const useCreateAttribute = () => {
  return useMutation({
    mutationFn: createAttribute,
  });
};

// Update

const updateAttribute = async (payload: IUpdateAttributePayload) => {
  const { id, ...rest } = payload;
  const result = await patchRequest(`${attributeUrl}/${id}`, rest);
  return result.data as IAttribute;
};

export const useUpdateAttribute = () => {
  return useMutation({
    mutationFn: updateAttribute,
  });
};

const deleteAttribute = async (id: number) => {
  const result = await deleteRequest(`${attributeUrl}/${id}`);
  return result.data;
};

export const useDeleteAttribute = () => {
  return useMutation({
    mutationFn: deleteAttribute,
  });
};
