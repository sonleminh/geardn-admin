import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import { useMutation, useQuery } from '@tanstack/react-query';

import { ICreateModel, IModel, IUpdateModel } from '@/interfaces/IModel';
import { ICategory } from '@/interfaces/IProduct';
import { QueryKeys } from '@/constants/query-key';

type TModelsRes = {
  modelList: IModel[];
  total: number;
};

export type TInitRes = {
  categoryList: ICategory[];
};

const modelUrl = '/model';

const getInitialForCreate = async () => {
  const result = await getRequest(`${modelUrl}/initial-for-create`);
  return result.data as TInitRes;
};

export const useGetInitialForCreate = () => {
  return useQuery({
    queryKey: [QueryKeys.Model],
    queryFn: () => getInitialForCreate(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getModelList = async () => {
  const result = await getRequest(`${modelUrl}`);
  return result.data as TModelsRes;
};

export const useGetModelList = () => {
  return useQuery({
    queryKey: [QueryKeys.Model],
    queryFn: () => getModelList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getModelById = async (id: string) => {
  const result = await getRequest(`${modelUrl}/${id}`);
  return result.data as IModel;
};

export const useGetModelById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.Model, id],
    queryFn: () => getModelById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getModelByProductId = async (id: string) => {
  const result = await getRequest(`${modelUrl}/product/${id}`);
  return result.data as IModel[];
};

export const useGetModelByProductId = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.Model, id],
    queryFn: () => getModelByProductId(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createModel = async (payload: ICreateModel) => {
  const result = await postRequest(`${modelUrl}`, payload);
  return result.data as IModel;
};

export const useCreateModel = () => {
  return useMutation({
    mutationFn: createModel,
  });
};

// Update

const updateModel = async (payload: IUpdateModel) => {
  const { _id, ...rest } = payload;
  const result = await patchRequest(`${modelUrl}/${_id}`, rest);
  return result.data as IModel;
};

export const useUpdateModel = () => {
  return useMutation({
    mutationFn: updateModel,
  });
};

const deleteModel = async (id: string) => {
  const result = await deleteRequest(`${modelUrl}/${id}`);
  return result.data;
};

export const useDeleteModel = () => {
  return useMutation({
    mutationFn: deleteModel,
  });
};
