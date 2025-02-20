import { QueryKeys } from '@/constants/query-key';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getRequest, postRequest } from '../axios';

import { IProductSku } from '@/interfaces/IProductSku';
import { ICreateSku, ISku, IUpdateSkuPayload } from '@/interfaces/ISku';

type TSkusRes = {
  status: number;
  message: string;
  data: IProductSku[];
};

const productSkuUrl = '/product-skus';

const getSkusByProductId = async (id: number) => {
  const result = await getRequest(`products/${id}/skus`);
  return (result.data as TSkusRes).data;
};

export const useGetSkusByProductId = (id: number) => {
  return useQuery({
    queryKey: [QueryKeys.Sku, id],
    queryFn: () => getSkusByProductId(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createSku = async (payload: ICreateSku) => {
  const result = await postRequest(`${productSkuUrl}`, payload);
  return result.data as ISku;
};

export const useCreateSku = () => {
  return useMutation({
    mutationFn: createSku,
  });
};

const updateSku = async (payload: IUpdateSkuPayload) => {
  const { id, ...rest } = payload;
  const result = await postRequest(`${productSkuUrl}/${id}`, rest);
  return result.data as ISku;
};

export const useUpdateSku = () => {
  return useMutation({
    mutationFn: updateSku,
  });
};
