import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';
import {
  ICategory,
  ICreateCategory,
  IUpdateCategoryPayload,
} from '@/interfaces/ICategory';
type TCategorysRes = {
  categories: ICategory[];
  total: number;
};

const categoryUrl = '/category';

const getCategoryList = async () => {
  const result = await getRequest(`${categoryUrl}`);
  return result.data as TCategorysRes;
};

export const useGetCategoryList = () => {
  return useQuery({
    queryKey: [QueryKeys.Category],
    queryFn: () => getCategoryList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getCategoryById = async (id: string) => {
  const result = await getRequest(`${categoryUrl}/${id}`);
  return result.data as ICategory;
};

export const useGetCategoryById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.Category, id],
    queryFn: () => getCategoryById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createCategory = async (payload: ICreateCategory) => {
  const result = await postRequest(`${categoryUrl}`, payload);
  return result.data as ICategory;
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: createCategory,
  });
};

// Update

const updateCategory = async (payload: IUpdateCategoryPayload) => {
  const { _id, ...rest } = payload;
  const result = await patchRequest(`${categoryUrl}/${_id}`, rest);
  return result.data as ICategory;
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: updateCategory,
  });
};

const deleteCategory = async (id: string) => {
  const result = await deleteRequest(`${categoryUrl}/${id}`);
  return result.data;
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: deleteCategory,
  });
};
