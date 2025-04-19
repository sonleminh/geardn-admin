import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';
import {
  IWarehouse,
  ICreateWarehouse,
  IUpdateWarehousePayload,
} from '@/interfaces/IWarehouse';
type TWarehousesRes = {
  success: boolean;
  message: string;
  data: IWarehouse[];
  total: number;
};

type TWarehouseById = {
  status: number;
  message: string;
  data: IWarehouse;
};

const warehouseUrl = '/warehouses';

const getWarehouseList = async () => {
  const result = await getRequest(`${warehouseUrl}`);
  return result.data as TWarehousesRes;
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
  const result = await getRequest(`${warehouseUrl}/${id}`);
  return result.data as TWarehouseById;
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
  const result = await postRequest(`${warehouseUrl}`, payload);
  return result.data as IWarehouse;
};

export const useCreateWarehouse = () => {
  return useMutation({
    mutationFn: createWarehouse,
  });
};

const updateWarehouse = async (payload: IUpdateWarehousePayload) => {
  const { id, ...rest } = payload;
  const result = await patchRequest(`${warehouseUrl}/${id}`, rest);
  return result.data as IWarehouse;
};

export const useUpdateWarehouse = () => {
  return useMutation({
    mutationFn: updateWarehouse,
  });
};

const deleteWarehouse = async (id: number) => {
  const result = await deleteRequest(`${warehouseUrl}/${id}`);
  return result.data;
};

export const useDeleteWarehouse = () => {
  return useMutation({
    mutationFn: deleteWarehouse,
  });
};
