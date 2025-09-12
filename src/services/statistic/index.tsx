import {
  IOrderStats,
  IOrderSummaryStats,
  IRevenueProfitStats,
  IRevenueProfitSummaryStats,
} from '@/interfaces/IStats';
import { axiosInstance } from '../axiosInstance';
import { TBaseResponse } from '@/types/response.type';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

const statisticUrl = '/statistics';

interface IOverviewStats {
  total: {
    revenue: number;
    profit: number;
    totalCurrentMonthRevenue: number;
    orders: number;
    pendingOrders: number;
    canceledOrders: number;
    deliveredOrders: number;
    deliveredThisMonthCount: number;
  };
  growth: {
    revenue: number;
    profit: number;
    delivered: number;
  };
  bestSellingProduct: {
    productId: number;
    productName: string;
    imageUrl: string;
    quantitySold: number;
    sellingPrice: number;
  }[];
  bestSellingCategory: {
    categoryId: number;
    categoryName: string;
    quantitySold: number;
    revenue: number;
  }[];
}

const getOverviewStats = async () => {
  const result = await axiosInstance.get(`${statisticUrl}/overview`);
  return result.data as TBaseResponse<IOverviewStats>;
};

export const useGetOverviewStats = () => {
  return useQuery({
    queryKey: [],
    queryFn: () => getOverviewStats(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getRevenueProfitStats = async (query: {
  fromDate: Date;
  toDate: Date;
}) => {
  const result = await axiosInstance.get(`${statisticUrl}/revenue-profit`, {
    params: {
      fromDate: query.fromDate.toISOString(),
      toDate: query.toDate.toISOString(),
    },
  });
  return result.data as TBaseResponse<IRevenueProfitStats>;
};

export const useGetRevenueProfitStats = (query: {
  fromDate: Date;
  toDate: Date;
}) => {
  return useQuery({
    queryKey: [QueryKeys.RevenueProfitDailyStats, query],
    queryFn: () => getRevenueProfitStats(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getRevenueProfitSummaryStats = async () => {
  const result = await axiosInstance.get(
    `${statisticUrl}/revenue-profit-summary`
  );
  return result.data as TBaseResponse<IRevenueProfitSummaryStats>;
};

export const useGetRevenueProfitSummaryStats = () => {
  return useQuery({
    queryKey: [QueryKeys.RevenueProfitDailyStats],
    queryFn: () => getRevenueProfitSummaryStats(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getOrderStats = async (query: { fromDate: Date; toDate: Date }) => {
  const result = await axiosInstance.get(`${statisticUrl}/order`, {
    params: {
      fromDate: query.fromDate.toISOString(),
      toDate: query.toDate.toISOString(),
    },
  });
  return result.data as TBaseResponse<IOrderStats>;
};

export const useGetOrderStats = (query: { fromDate: Date; toDate: Date }) => {
  return useQuery({
    queryKey: [QueryKeys.RevenueProfitDailyStats, query],
    queryFn: () => getOrderStats(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getOrderSummaryStats = async () => {
  const result = await axiosInstance.get(`${statisticUrl}/order-summary`);
  return result.data as TBaseResponse<IOrderSummaryStats>;
};

export const useGetOrderSummaryStats = () => {
  return useQuery({
    queryKey: [QueryKeys.RevenueProfitDailyStats],
    queryFn: () => getOrderSummaryStats(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
