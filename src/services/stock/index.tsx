import { QueryKeys } from '@/constants/query-key';
import { IStock } from '@/interfaces/IStock';
import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../axios';
type TStocksRes = {
  success: boolean;
  message: string;
  data: IStock[];
  total: number;
};

const stockeUrl = '/stocks';

const getStocksByWarehouse = async (id: number | undefined) => {
  const result = await getRequest(`${stockeUrl}/${id}/warehouses`);
  return result.data as TStocksRes;
};

export const useGetStocksByWarehouse = (id: number | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.Stock],
    queryFn: () => getStocksByWarehouse(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};
