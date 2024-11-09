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
