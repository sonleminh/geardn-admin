import { QueryKeys } from '@/constants/query-key';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getRequest, postRequest } from '../axios';

import { ICreateOrder, IOrder } from '@/interfaces/IOrder';
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
  districts: IIDistrict[];
}

interface IIDistrict {
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
    'https://provinces.open-api.vn/api/?depth=3',
    { withCredentials: false }
  );
  return result.data as IProvince[];
};

export const useGetProvinces = () => {
  return useQuery({
    queryKey: [],
    queryFn: () => getProvince(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};
