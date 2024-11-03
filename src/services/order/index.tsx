import { QueryKeys } from '@/constants/query-key';
import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../axios';

import { IOrder } from '@/interfaces/IOrder';
import { IQuery } from '@/interfaces/IQuery';
import queryString from 'query-string';

type TOrderRes = {
  orders: IOrder[];
  total: number;
};

const orderUrl = '/order';

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
