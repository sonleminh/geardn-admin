import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import {
  IAttributeValue,
  ICreateAttributeValue,
  IUpdateAttributeValuePayload,
} from '@/interfaces/IAttributeValue';

type TAttributeValueListRes = {
  status: number;
  message: string;
  data: IAttributeValue[];
  total: number;
};

type TAttributeValueListByTypeRes = {
  data: IAttributeValue[];
  status: number;
  message: string;
};

type TAttributeValueRes = {
  data: IAttributeValue;
  status: number;
  message: string;
};

const attributeValueUrl = '/attribute-values';

const createAttribute = async (payload: ICreateAttributeValue) => {
  const result = await axiosInstance.post(`${attributeValueUrl}`, payload);
  return result.data as IAttributeValue;
};

export const useCreateAttributeValue = () => {
  return useMutation({
    mutationFn: createAttribute,
  });
};

const getAttributeValueById = async (id: number | undefined) => {
  const result = await axiosInstance.get(`${attributeValueUrl}/${id}`);
  return result.data as TAttributeValueRes;
};

export const useGetAttributeValueById = (id: number | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.AttributeValue, id],
    queryFn: () => getAttributeValueById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getAttributeValuesByAttributeId = async (
  attributeId: number | undefined
) => {
  const result = await axiosInstance.get(
    `${attributeValueUrl}/attribute/${attributeId}`
  );
  return result.data as TAttributeValueListByTypeRes;
};

export const useGetAttributeValuesByAttributeId = (
  attributeId: number | undefined
) => {
  return useQuery({
    queryKey: [QueryKeys.Product, attributeId],
    queryFn: () => getAttributeValuesByAttributeId(attributeId),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!attributeId,
  });
};

const getAttributeValueList = async () => {
  const result = await axiosInstance.get(`${attributeValueUrl}`);
  return result.data as TAttributeValueListRes;
};

export const useGetAttributeValueList = () => {
  return useQuery({
    queryKey: [QueryKeys.AttributeValue],
    queryFn: () => getAttributeValueList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

// Update

const updateAttributeValue = async (payload: IUpdateAttributeValuePayload) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${attributeValueUrl}/${id}`, rest);
  return result.data as IAttributeValue;
};

export const useUpdateAttributeValue = () => {
  return useMutation({
    mutationFn: updateAttributeValue,
  });
};

const deleteAttributeValue = async (id: number) => {
  const result = await axiosInstance.delete(`${attributeValueUrl}/${id}`);
  return result.data;
};

export const useDeleteAttributeValue = () => {
  return useMutation({
    mutationFn: deleteAttributeValue,
  });
};
