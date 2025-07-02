import { IProfitRevenueDailyStats } from '@/interfaces/IProfitRevenueDailyStats';
import { axiosInstance } from '../axiosInstance';
import { TBaseResponse } from '@/types/response.type';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';

const statisticUrl = '/statistics';

const getProfitRevenueDailyStats = async (query: {
  fromDate: Date;
  toDate: Date;
}) => {
  const result = await axiosInstance.get(
    `${statisticUrl}/profit-revenue-daily`,
    {
      params: {
        fromDate: query.fromDate.toISOString(),
        toDate: query.toDate.toISOString(),
      },
    }
  );
  return result.data as TBaseResponse<IProfitRevenueDailyStats>;
};

export const useGetProfitRevenueDailyStats = (query: {
  fromDate: Date;
  toDate: Date;
}) => {
  return useQuery({
    queryKey: [QueryKeys.ProfitRevenueDailyStats, query],
    queryFn: () => getProfitRevenueDailyStats(query),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};
