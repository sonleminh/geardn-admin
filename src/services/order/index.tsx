import { QueryKeys } from '@/constants/query-key';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';

import {
  ICreateOrder,
  IOrder,
  IUpdateOrder,
  IUpdateOrderStatus,
} from '@/interfaces/IOrder';
import { IQuery } from '@/interfaces/IQuery';
import queryString from 'query-string';

type TOrderRes = {
  orders: IOrder[];
  total: number;
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
  wards: IWards[];
}

interface IWards {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  short_codename: string;
}

const orderUrl = '/order';

const createOrder = async (payload: ICreateOrder) => {
  const result = await postRequest(`${orderUrl}`, payload);
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
  const result = await getRequest(`${orderUrl}?${queryParams}`);
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
  const result = await getRequest(`${orderUrl}/${id}`);
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

const getProvince = async () => {
  const result = await getRequest(
    'https://provinces.open-api.vn/api/?depth=2',
    { withCredentials: false }
  );
  return result.data as IProvince[];
};

export const useGetProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: () => getProvince(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getDistrictByCode = async (code: string) => {
  console.log(3, code);
  const result = await getRequest(
    `https://provinces.open-api.vn/api/d/${code}?depth=2`,
    { withCredentials: false }
  );
  return result.data as IDistrict;
};

export const useGetDistrictByCode = (code: string) => {
  return useQuery({
    queryKey: ['district', code],
    queryFn: () => getDistrictByCode(code),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!code,
  });
};

const updateOrder = async (payload: IUpdateOrder) => {
  const { _id, ...rest } = payload;
  const result = await patchRequest(`${orderUrl}/${_id}`, rest);
  return result.data as IOrder;
};

export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: updateOrder,
  });
};

const updateOrderStatus = async (payload: IUpdateOrderStatus) => {
  const { _id, ...rest } = payload;
  const result = await patchRequest(`${orderUrl}/${_id}/status`, rest);
  return result.data as IOrder;
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: updateOrderStatus,
  });
};

const deleteOrder = async (id: string) => {
  const result = await deleteRequest(`${orderUrl}/${id}`);
  return result.data;
};

export const useDeleteOrder = () => {
  return useMutation({
    mutationFn: deleteOrder,
  });
};
