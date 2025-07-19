import { QueryKeys } from '@/constants/query-key';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';

import { IStockItem } from '@/interfaces/IStock';
import { TBaseResponse, TPaginatedResponse } from '@/types/response.type';

const stockeUrl = '/stocks';

const getStocks = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const result = await axiosInstance.get(`${stockeUrl}`, {
    params: {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    },
  });
  return result.data as TPaginatedResponse<IStockItem>;
};

export const useGetStocks = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: [QueryKeys.Stock, params],
    queryFn: () => getStocks(params),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getStockByProduct = async (id: number | undefined) => {
  const result = await axiosInstance.get(`${stockeUrl}/${id}/products`);
  return result.data as TBaseResponse<IStockItem>;
};

export const useGetStockByProduct = (id: number | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.Stock, QueryKeys.Product, id],
    queryFn: () => getStockByProduct(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};
