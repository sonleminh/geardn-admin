import { QueryKeys } from '@/constants/query-key';
import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../axios';

import { IProductSku } from '@/interfaces/IProductSku';
import { IAttribute } from '@/interfaces/IAttribute';

type TSkusRes = {
  status: number;
  message: string;
  data: IProductSku[];
};

type TAttributeRes = {
  status: number;
  message: string;
  data: IAttribute[];
};

const productUrl = '/products';

const getSkusByProductId = async (id: number) => {
  const result = await getRequest(`${productUrl}/${id}/skus`);
  return (result.data as TSkusRes).data;
};

export const useGetSkusByProductId = (id: number) => {
  return useQuery({
    queryKey: [QueryKeys.Product, id],
    queryFn: () => getSkusByProductId(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const getAttributesByType = async (type: string) => {
  const result = await getRequest(`product-attributes/type/${type}`);
  return (result.data as TAttributeRes).data;
};

export const useGetAttributesByType = (type: string) => {
  return useQuery({
    queryKey: [QueryKeys.Product, type],
    queryFn: () => getAttributesByType(type),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!type,
  });
};
