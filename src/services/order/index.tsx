import { QueryKeys } from '@/constants/query-key';
import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';

import {
  ICancelOrder,
  ICreateOrder,
  IOrder,
  IUpdateDeliveryFailed,
  IUpdateOrder,
  IUpdateOrderConfirm,
  IUpdateOrderStatus,
} from '@/interfaces/IOrder';
import { IOrderUpdateHistoryLog } from '@/interfaces/IOrderUpdateHistoryLog';
import { TBaseResponse, TPaginatedResponse } from '@/types/response.type';

interface IGetOrderListQuery {
  page?: number;
  limit?: number;
  productIds?: string[];
  statuses?: string[];
  fromDate?: string;
  toDate?: string;
  search?: string;
}
interface IGetOrderUpdateHistoryListQuery {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

interface IProvince {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  districts: IDistrict[];
}

interface IDistrict {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards: IWard[];
}

interface IWard {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  short_codename: string;
}

const orderUrl = '/orders';
const provinceUrl = '/province';

const createOrder = async (payload: ICreateOrder) => {
  const result = await axiosInstance.post(`${orderUrl}`, payload);
  return result.data as IOrder;
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
  });
};

const getOrderList = async (query: IGetOrderListQuery) => {
  const result = await axiosInstance.get(`${orderUrl}`, {
    params: {
      page: query?.page ?? 0,
      limit: query?.limit ?? 10,
      productIds: query?.productIds?.join(','),
      statuses: query?.statuses?.join(','),
      fromDate: query?.fromDate,
      toDate: query?.toDate,
      search: query?.search,
    },
  });
  return result.data as TPaginatedResponse<IOrder>;
};

export const useGetOrderList = (query: IGetOrderListQuery) => {
  return useQuery({
    queryKey: [QueryKeys.Order, query],
    queryFn: () => getOrderList(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getOrderById = async (id: string) => {
  const result = await axiosInstance.get(`${orderUrl}/admin/${id}`);
  return result.data as TBaseResponse<IOrder>;
};

export const useGetOrderById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.Order, id],
    queryFn: () => getOrderById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getOrderUpdateHistoryList = async (
  query: IGetOrderUpdateHistoryListQuery
) => {
  const result = await axiosInstance.get(`${orderUrl}/update-history-logs`, {
    params: {
      page: query?.page ?? 0,
      limit: query?.limit ?? 10,
      fromDate: query?.fromDate,
      toDate: query?.toDate,
      search: query?.search,
    },
  });
  return result.data as TPaginatedResponse<IOrderUpdateHistoryLog>;
};

export const useGetOrderUpdateHistoryList = (
  query: IGetOrderUpdateHistoryListQuery
) => {
  return useQuery({
    queryKey: [QueryKeys.Order, query],
    queryFn: () => getOrderUpdateHistoryList(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const updateOrder = async (payload: IUpdateOrder) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${orderUrl}/${id}`, rest);
  return result.data as IOrder;
};

export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: updateOrder,
  });
};

const updateOrderStatus = async (payload: IUpdateOrderStatus) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${orderUrl}/${id}/status`, rest);
  return result.data as IOrder;
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: updateOrderStatus,
  });
};

const updateOrderConfirm = async (payload: IUpdateOrderConfirm) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${orderUrl}/${id}/confirm`, rest);
  return result.data as IOrder;
};

export const useUpdateOrderConfirm = () => {
  return useMutation({
    mutationFn: updateOrderConfirm,
  });
};

const updateDeliveryFailed = async (payload: IUpdateDeliveryFailed) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(
    `${orderUrl}/${id}/delivery-failed`,
    rest
  );
  return result.data;
};

export const useUpdateDeliveryFailed = () => {
  return useMutation({
    mutationFn: updateDeliveryFailed,
  });
};

const cancelOrder = async (payload: ICancelOrder) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(`${orderUrl}/${id}/cancel`, rest);
  return result.data;
};

export const useCancelOrder = () => {
  return useMutation({
    mutationFn: cancelOrder,
  });
};

const getProvinceList = async () => {
  const result = await axiosInstance.get(`${provinceUrl}`, {
    withCredentials: false,
  });
  return result.data as TBaseResponse<IProvince[]>;
};

export const useGetProvinceList = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: () => getProvinceList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getProvince = async (code: number | undefined) => {
  const result = await axiosInstance.get(`${provinceUrl}/${code}`, {
    withCredentials: false,
  });
  return result.data as TBaseResponse<IProvince>;
};

export const useGetProvince = (code: number | undefined) => {
  return useQuery({
    queryKey: ['province', code],
    queryFn: () => getProvince(code),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!code,
  });
};

const getDistrict = async (code: number | undefined) => {
  const result = await axiosInstance.get(`${provinceUrl}/d/${code}`, {
    withCredentials: false,
  });
  return result.data as TBaseResponse<IDistrict>;
};

export const useGetDistrict = (code: number | undefined) => {
  return useQuery({
    queryKey: ['district'],
    queryFn: () => getDistrict(code),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!code,
  });
};
