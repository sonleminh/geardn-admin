import { useMutation, useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import {
  ICancelOrder,
  ICreateOrder,
  IOrder,
  IUpdateDeliveryFailed,
  IUpdateOrder,
  IUpdateOrderConfirm,
  IUpdateOrderStatus,
} from '@/interfaces/IOrder';
import { TBaseResponse, TPaginatedResponse } from '@/types/response.type';
import { IOrderUpdateHistoryLog } from '@/interfaces/IOrderUpdateHistoryLog';
import {
  ICompleteReturnRequest,
  IOrderReturnRequest,
  IUpdateOrderReturnRequestStatus,
} from '@/interfaces/IOrderReturnRequest';

interface IGetOrderReturnRequestListQuery {
  page?: number;
  limit?: number;
  productIds?: string[];
  fromDate?: string;
  toDate?: string;
  search?: string;
}

const orderReturnRequestUrl = '/order-return-requests';

const getOrderReturnRequestList = async (
  query: IGetOrderReturnRequestListQuery
) => {
  const result = await axiosInstance.get(`${orderReturnRequestUrl}`, {
    params: {
      page: query?.page ?? 0,
      limit: query?.limit ?? 10,
      productIds: query?.productIds?.join(','),
      search: query?.search,
    },
  });
  return result.data as TPaginatedResponse<IOrderReturnRequest>;
};

export const useGetOrderReturnRequestList = (
  query: IGetOrderReturnRequestListQuery
) => {
  return useQuery({
    queryKey: [QueryKeys.OrderReturnRequest, query],
    queryFn: () => getOrderReturnRequestList(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getOrderReturnRequestById = async (id: string) => {
  const result = await axiosInstance.get(`${orderReturnRequestUrl}/${id}`);
  return result.data as TBaseResponse<IOrderReturnRequest>;
};

export const useGetOrderReturnRequestById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.OrderReturnRequest, id],
    queryFn: () => getOrderReturnRequestById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const updateOrderReturnRequestStatus = async (
  payload: IUpdateOrderReturnRequestStatus
) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(
    `${orderReturnRequestUrl}/${id}/status`,
    rest
  );
  return result.data as IOrderReturnRequest;
};

export const useUpdateOrderReturnRequestStatus = () => {
  return useMutation({
    mutationFn: updateOrderReturnRequestStatus,
  });
};

const completeReturnRequest = async (payload: ICompleteReturnRequest) => {
  const { id, ...rest } = payload;
  const result = await axiosInstance.patch(
    `${orderReturnRequestUrl}/${id}/complete`,
    rest
  );
  return result.data as IOrderReturnRequest;
};

export const useCompleteReturnRequest = () => {
  return useMutation({
    mutationFn: completeReturnRequest,
  });
};
