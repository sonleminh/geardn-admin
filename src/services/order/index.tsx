import { useMutation, useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import {
  ICreateOrder,
  IOrder,
  IUpdateOrder,
  IUpdateOrderStatus,
} from '@/interfaces/IOrder';
import { IQuery } from '@/interfaces/IQuery';

type TOrderRes = {
  orders: IOrder[];
  total: number;
  status_counts: { status: string; count: number }[];
};

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

const orderUrl = '/order';

const createOrder = async (payload: ICreateOrder) => {
  const result = await axiosInstance.post(`${orderUrl}`, payload);
  return result.data as IOrder;
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
  });
};

const getOrderList = async (query: IQuery) => {
  const newParams = { ...query, page: query.page ? query.page + 1 : 1 };
  const queryParams = queryString.stringify(newParams ?? {});
  const result = await axiosInstance.get(`${orderUrl}?${queryParams}`);
  return result.data as TOrderRes;
};

export const useGetOrderList = (query: IQuery) => {
  return useQuery({
    queryKey: [QueryKeys.Order, query],
    queryFn: () => getOrderList(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getOrderById = async (id: string) => {
  const result = await axiosInstance.get(`${orderUrl}/admin/${id}`);
  return result.data as IOrder;
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

const getProvinceList = async () => {
  const result = await axiosInstance.get('https://provinces.open-api.vn/api', {
    withCredentials: false,
  });
  return result.data as IProvince[];
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
  const result = await axiosInstance.get(
    `https://provinces.open-api.vn/api/p/${code}?depth=2`,
    {
      withCredentials: false,
    }
  );
  return result.data as IProvince;
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
  const result = await axiosInstance.get(
    `https://provinces.open-api.vn/api/d/${code}?depth=2`,
    { withCredentials: false }
  );
  return result.data as IDistrict;
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

const updateOrder = async (payload: IUpdateOrder) => {
  const { _id, ...rest } = payload;
  const result = await axiosInstance.patch(`${orderUrl}/${_id}`, rest);
  return result.data as IOrder;
};

export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: updateOrder,
  });
};

const updateOrderStatus = async (payload: IUpdateOrderStatus) => {
  const { _id, ...rest } = payload;
  const result = await axiosInstance.patch(`${orderUrl}/${_id}/status`, rest);
  return result.data as IOrder;
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: updateOrderStatus,
  });
};

const deleteOrder = async (id: string) => {
  const result = await axiosInstance.delete(`${orderUrl}/${id}`);
  return result.data;
};

export const useDeleteOrder = () => {
  return useMutation({
    mutationFn: deleteOrder,
  });
};
