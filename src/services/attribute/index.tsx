import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import {
  IAttribute,
  ICreateAttribute,
  IUpdateAttributePayload,
} from '@/interfaces/IAttribute';
import { TBaseResponse } from '@/types/response.type';

const attributeUrl = '/attributes';

const createAttribute = async (payload: ICreateAttribute) => {
  const result = await axiosInstance.post(`${attributeUrl}`, payload);
  return result.data as IAttribute;
};

export const useCreateAttribute = () => {
  return useMutation({
    mutationFn: createAttribute,
  });
};

const getAttributeById = async (id: string) => {
  const result = await axiosInstance.get(`${attributeUrl}/${id}`);
  return result.data as TBaseResponse<IAttribute>;
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

const getAttributeList = async () => {
  const result = await axiosInstance.get(`${attributeUrl}`);
  return result.data as TBaseResponse<IAttribute[]>;
};

export const useGetAttributeList = () => {
  return useQuery({
    queryKey: [QueryKeys.Attribute],
    queryFn: () => getAttributeList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const updateAttribute = async (payload: IUpdateAttributePayload) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${attributeUrl}/${id}`, rest);
  return result.data as IAttribute;
};

export const useUpdateAttribute = () => {
  return useMutation({
    mutationFn: updateAttribute,
  });
};

const deleteAttribute = async (id: number) => {
  const result = await axiosInstance.delete(`${attributeUrl}/${id}`);
  return result.data;
};

export const useDeleteAttribute = () => {
  return useMutation({
    mutationFn: deleteAttribute,
  });
};

const restoreAttribute = async (id: number) => {
  const result = await axiosInstance.patch(`${attributeUrl}/${id}/restore`);
  return result.data;
};

export const useRestoreAttribute = () => {
  return useMutation({
    mutationFn: restoreAttribute,
  });
};

const deleteAttributePermanent = async (id: number) => {
  const result = await axiosInstance.delete(`${attributeUrl}/${id}/permanent`);
  return result.data;
};

export const useDeleteAttributePermanent = () => {
  return useMutation({
    mutationFn: deleteAttributePermanent,
  });
};
