import { QueryKeys } from '@/constants/query-key';
import { axiosInstance } from '../axiosInstance';
import { useQuery } from '@tanstack/react-query';

import {
  IProductWithStock,
  IStock,
  IStockByWarehouseItem,
} from '@/interfaces/IStock';
import { TBaseResponse, TPaginatedResponse } from '@/types/response.type';
import { IProduct } from '@/interfaces/IProduct';

const stockeUrl = '/stocks';

const getStocksByWarehouse = async (id: number | undefined) => {
  const result = await axiosInstance.get(`${stockeUrl}/${id}/warehouses`);
  return result.data as TPaginatedResponse<IStockByWarehouseItem>;
};

export const useGetStocksByWarehouse = (id: number | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.Stock, id],
    queryFn: () => getStocksByWarehouse(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getStockByProduct = async (id: number | undefined) => {
  const result = await axiosInstance.get(`${stockeUrl}/${id}/products`);
  return result.data as TBaseResponse<IProductWithStock>;
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
