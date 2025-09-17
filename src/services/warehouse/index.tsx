import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import {
  IWarehouse,
  ICreateWarehouse,
  IUpdateWarehousePayload,
} from '@/interfaces/IWarehouse';
import { TBaseResponse } from '@/types/response.type';

const warehouseUrl = '/warehouses';

const getWarehouseList = async () => {
  const result = await axiosInstance.get(`${warehouseUrl}`);
  return result.data as TBaseResponse<IWarehouse[]>;
};

export const useGetWarehouseList = () => {
  return useQuery({
    queryKey: [QueryKeys.Warehouse],
    queryFn: () => getWarehouseList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getWarehouseById = async (id: number | undefined) => {
  const result = await axiosInstance.get(`${warehouseUrl}/${id}`);
  return result.data as TBaseResponse<IWarehouse>;
};

export const useGetWarehouseById = (id: number | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.Warehouse, id],
    queryFn: () => getWarehouseById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createWarehouse = async (payload: ICreateWarehouse) => {
  const result = await axiosInstance.post(`${warehouseUrl}`, payload);
  return result.data as IWarehouse;
};

export const useCreateWarehouse = () => {
  return useMutation({
    mutationFn: createWarehouse,
  });
};

const updateWarehouse = async (payload: IUpdateWarehousePayload) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${warehouseUrl}/${id}`, rest);
  return result.data as IWarehouse;
};

export const useUpdateWarehouse = () => {
  return useMutation({
    mutationFn: updateWarehouse,
  });
};

const deleteWarehouse = async (id: number) => {
  const result = await axiosInstance.delete(`${warehouseUrl}/${id}`);
  return result.data;
};

export const useDeleteWarehouse = () => {
  return useMutation({
    mutationFn: deleteWarehouse,
  });
};

const restoreWarehouse = async (id: number) => {
  const result = await axiosInstance.patch(`${warehouseUrl}/${id}/restore`);
  return result.data;
};

export const useRestoreWarehouse = () => {
  return useMutation({
    mutationFn: restoreWarehouse,
  });
};

const deleteWarehousePermanent = async (id: number) => {
  const result = await axiosInstance.delete(`${warehouseUrl}/${id}/permanent`);
  return result.data;
};

export const useDeleteWarehousePermanent = () => {
  return useMutation({
    mutationFn: deleteWarehousePermanent,
  });
};
