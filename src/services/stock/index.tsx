import { QueryKeys } from '@/constants/query-key';
import { axiosInstance } from '../axiosInstance';
import { useQuery } from '@tanstack/react-query';

import { IStockByWarehouseItem } from '@/interfaces/IStock';
import { TBaseResponse, TPaginatedResponse } from '@/types/response.type';

const stockeUrl = '/stocks';

const getStocksByWarehouse = async (
  id: number | undefined,
  params?: { page?: number; limit?: number; search?: string }
) => {
  const result = await axiosInstance.get(`${stockeUrl}/${id}/warehouses`, {
    params: {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    },
  });
  return result.data as TPaginatedResponse<IStockByWarehouseItem>;
};

export const useGetStocksByWarehouse = (
  id: number | undefined,
  params?: { page?: number; limit?: number; search?: string }
) => {
  return useQuery({
    queryKey: [QueryKeys.Stock, id, params],
    queryFn: () => getStocksByWarehouse(id, params),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getStockByProduct = async (id: number | undefined) => {
  const result = await axiosInstance.get(`${stockeUrl}/${id}/products`);
  return result.data as TBaseResponse<IStockByWarehouseItem>;
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
