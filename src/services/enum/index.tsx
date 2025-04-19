import { QueryKeys } from '@/constants/query-key';
import { IEnum } from '@/interfaces/IEnum';
import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../axios';

type TEnumRes = {
  status: number;
  message: string;
  data: IEnum[];
};

const categoryUrl = '/enums';

const getEnumByContext = async (context: string | undefined) => {
  const result = await getRequest(`${categoryUrl}/${context}`);
  return result.data as TEnumRes;
};

export const useGetEnumByContext = (context: string | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.Enum, context],
    queryFn: () => getEnumByContext(context),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!context,
  });
};
