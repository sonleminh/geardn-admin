import { QueryKeys } from '@/constants/query-key';
import {
  IAttribute,
  ICreateAttribute,
  IUpdateAttributePayload,
} from '@/interfaces/IAttribute';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';

type TAttributesRes = {
  attributeList: IAttribute[];
  total: number;
};

const attributeUrl = '/attribute';

const getAttributeList = async () => {
  const result = await getRequest(`${attributeUrl}`);
  return result.data as TAttributesRes;
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
  return result.data as IAttribute;
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
  const { _id, ...rest } = payload;
  const result = await patchRequest(`${attributeUrl}/${_id}`, rest);
  return result.data as IAttribute;
};

export const useUpdateAttribute = () => {
  return useMutation({
    mutationFn: updateAttribute,
  });
};

const deleteAttribute = async (id: string) => {
  const result = await deleteRequest(`${attributeUrl}/${id}`);
  return result.data;
};

export const useDeleteAttribute = () => {
  return useMutation({
    mutationFn: deleteAttribute,
  });
};
