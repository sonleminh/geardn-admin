import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import { useMutation, useQuery } from '@tanstack/react-query';

import { QueryKeys } from '@/constants/query-key';
import {
  IAttributeType,
  ICreateAttributeType,
  IUpdateAttributeTypePayload,
} from '@/interfaces/IAttributeType';

type TAttributeTypeListRes = {
  status: number;
  message: string;
  data: IAttributeType[];
  total: number;
};

type TAttributeTypeRes = {
  data: IAttributeType;
  status: number;
  message: string;
};

const attributeUrl = '/attribute-types';

const createAttribute = async (payload: ICreateAttributeType) => {
  const result = await postRequest(`${attributeUrl}`, payload);
  return result.data as IAttributeType;
};

export const useCreateAttributeType = () => {
  return useMutation({
    mutationFn: createAttribute,
  });
};

const getAttributeTypeById = async (id: string) => {
  const result = await getRequest(`${attributeUrl}/${id}`);
  return (result.data as TAttributeTypeRes).data;
};

export const useGetAttributeTypeById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.AttributeType, id],
    queryFn: () => getAttributeTypeById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getAttributeTypeList = async () => {
  const result = await getRequest(`${attributeUrl}`);
  return result.data as TAttributeTypeListRes;
};

export const useGetAttributeTypeList = () => {
  return useQuery({
    queryKey: [QueryKeys.Product],
    queryFn: () => getAttributeTypeList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const updateAttributeType = async (payload: IUpdateAttributeTypePayload) => {
  const { id, ...rest } = payload;
  const result = await patchRequest(`${attributeUrl}/${id}`, rest);
  return result.data as IAttributeType;
};

export const useUpdateAttributeType = () => {
  return useMutation({
    mutationFn: updateAttributeType,
  });
};

const deleteAttributeType = async (id: number) => {
  const result = await deleteRequest(`${attributeUrl}/${id}`);
  return result.data;
};

export const useDeleteAttributeType = () => {
  return useMutation({
    mutationFn: deleteAttributeType,
  });
};
