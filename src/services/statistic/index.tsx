import { IRevenueProfitStats } from '@/interfaces/IRevenueProfitStats';
import { axiosInstance } from '../axiosInstance';
import { TBaseResponse } from '@/types/response.type';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

const statisticUrl = '/statistics';

interface IOverviewStats {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  pendingOrders: number;
  bestSellingProduct: {
    productId: number;
    productName: string;
    imageUrl: string;
    quantitySold: number;
    price: number;
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
