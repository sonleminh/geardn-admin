import { deleteRequest, getRequest, patchRequest, postRequest } from '../axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/constants/query-key';
import {
  IPayment,
  ICreatePayment,
  IUpdatePaymentPayload,
} from '@/interfaces/IPayment';
type TPaymentsRes = {
  status: number;
  message: string;
  data: IPayment[];
};

type TPaymentById = {
  status: number;
  message: string;
  data: IPayment;
};

const paymentUrl = '/payment-methods';

const getPaymentList = async () => {
  const result = await getRequest(`${paymentUrl}`);
  return result.data as TPaymentsRes;
};

export const useGetPaymentList = () => {
  return useQuery({
    queryKey: [QueryKeys.Payment],
    queryFn: () => getPaymentList(),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getPaymentById = async (id: number) => {
  const result = await getRequest(`${paymentUrl}/${id}`);
  return result.data as TPaymentById;
};

export const useGetPaymentById = (id: number) => {
  return useQuery({
    queryKey: [QueryKeys.Payment, id],
    queryFn: () => getPaymentById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!id,
  });
};

const createPayment = async (payload: ICreatePayment) => {
  const result = await postRequest(`${paymentUrl}`, payload);
  return result.data as IPayment;
};

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: createPayment,
  });
};

// Update

const updatePayment = async (payload: IUpdatePaymentPayload) => {
  const { id, ...rest } = payload;
  const result = await patchRequest(`${paymentUrl}/${id}`, rest);
  return result.data as IPayment;
};

export const useUpdatePayment = () => {
  return useMutation({
    mutationFn: updatePayment,
  });
};

const deletePayment = async (id: number) => {
  const result = await deleteRequest(`${paymentUrl}/${id}`);
  return result.data;
};

export const useDeletePayment = () => {
  return useMutation({
    mutationFn: deletePayment,
  });
};
