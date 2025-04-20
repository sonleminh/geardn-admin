import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';
import {
  ICategory,
  ICreateCategory,
  IUpdateCategoryPayload,
} from '@/interfaces/ICategory';
type TCategorysRes = {
  success: boolean;
  message: string;
  data: ICategory[];
  total: number;
};

type TCategoryById = {
  status: number;
  message: string;
  data: ICategory;
};

const categoryUrl = '/categories';

const getCategoryList = async () => {
  const result = await axiosInstance.get(`${categoryUrl}`);
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

const getCategoryById = async (id: number) => {
  const result = await axiosInstance.get(`${categoryUrl}/${id}`);
  return (result.data as TCategoryById).data;
};

export const useGetCategoryById = (id: number) => {
  return useQuery({
    queryKey: [QueryKeys.Category, id],
    queryFn: () => getCategoryById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createCategory = async (payload: ICreateCategory) => {
  const result = await axiosInstance.post(`${categoryUrl}`, payload);
  return result.data as ICategory;
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: createCategory,
  });
};

// Update

const updateCategory = async (payload: IUpdateCategoryPayload) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${categoryUrl}/${id}`, rest);
  return result.data as ICategory;
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: updateCategory,
  });
};

const deleteCategory = async (id: number) => {
  const result = await axiosInstance.delete(`${categoryUrl}/${id}`);
  return result.data;
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: deleteCategory,
  });
};
