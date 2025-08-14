import { useMutation, useQuery } from '@tanstack/react-query';

import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import { ICreateImportLog, IImportLog } from '@/interfaces/IInventorytLog';
import { ICreateExportLog, IExportLog } from '@/interfaces/IInventorytLog';
import {
  ICreateAdjustmentLog,
  IAdjustmentLog,
} from '@/interfaces/IInventorytLog';
import { TBaseResponse, TPaginatedResponse } from '@/types/response.type';

interface IGetLogListParams {
  warehouseIds?: string[];
  productIds?: string[];
  types?: string[];
  reasons?: string[];
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

const importLogUrl = '/import-logs';
const exportLogUrl = '/export-logs';
const adjustmentLogUrl = '/adjustment-logs';

//IMPORT LOG

const createImportLog = async (payload: ICreateImportLog) => {
  const result = await axiosInstance.post(importLogUrl, payload);
  return result.data;
};

export const useCreateImportLog = () => {
  return useMutation({
    mutationFn: createImportLog,
  });
};

const getImportLogList = async (params?: IGetLogListParams) => {
  const result = await axiosInstance.get(`${importLogUrl}`, {
    params: {
      warehouseIds: params?.warehouseIds?.join(','),
      productIds: params?.productIds?.join(','),
      types: params?.types?.join(','),
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      page: params?.page,
      limit: params?.limit,
    },
  });
  return result.data as TPaginatedResponse<IImportLog>;
};

export const useGetImportLogList = (params?: IGetLogListParams) => {
  return useQuery({
    queryKey: [QueryKeys.ImportLog, params],
    queryFn: () => getImportLogList(params),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getImportLogById = async (id: string) => {
  const result = await axiosInstance.get(`${importLogUrl}/${id}`);
  return result.data as TBaseResponse<IImportLog>;
};

export const useGetImportLogById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.ImportLog, id],
    queryFn: () => getImportLogById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

//EXPORT LOG

const createExportLog = async (payload: ICreateExportLog) => {
  const result = await axiosInstance.post(exportLogUrl, payload);
  return result.data;
};

export const useCreateExportLog = () => {
  return useMutation({
    mutationFn: createExportLog,
  });
};

const getExportLogList = async (params?: IGetLogListParams) => {
  const result = await axiosInstance.get(`${exportLogUrl}`, {
    params: {
      warehouseIds: params?.warehouseIds?.join(','),
      productIds: params?.productIds?.join(','),
      types: params?.types?.join(','),
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      page: params?.page,
      limit: params?.limit,
    },
  });
  return result.data as TPaginatedResponse<IExportLog>;
};

export const useGetExportLogList = (params?: IGetLogListParams) => {
  return useQuery({
    queryKey: [QueryKeys.ExportLog, params],
    queryFn: () => getExportLogList(params),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getExportLogById = async (id: string) => {
  const result = await axiosInstance.get(`${exportLogUrl}/${id}`);
  return result.data as TBaseResponse<IExportLog>;
};

export const useGetExportLogById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.ExportLog, id],
    queryFn: () => getExportLogById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

//ADJUSTMENT LOG

const createAdjustmentLog = async (payload: ICreateAdjustmentLog) => {
  const result = await axiosInstance.post(adjustmentLogUrl, payload);
  return result.data;
};

export const useCreateAdjustmentLog = () => {
  return useMutation({
    mutationFn: createAdjustmentLog,
  });
};

const getAdjustmentLogList = async (params?: IGetLogListParams) => {
  const result = await axiosInstance.get(`${adjustmentLogUrl}`, {
    params: {
      warehouseIds: params?.warehouseIds?.join(','),
      productIds: params?.productIds?.join(','),
      types: params?.types?.join(','),
      reasons: params?.reasons?.join(','),
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      page: params?.page,
      limit: params?.limit,
    },
  });
  return result.data as TPaginatedResponse<IAdjustmentLog>;
};

export const useGetAdjustmentLogList = (params?: IGetLogListParams) => {
  return useQuery({
    queryKey: [QueryKeys.AdjustmentLog, params],
    queryFn: () => getAdjustmentLogList(params),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

const getAdjustmentLogById = async (id: string) => {
  const result = await axiosInstance.get(`${adjustmentLogUrl}/${id}`);
  return result.data as TBaseResponse<IAdjustmentLog>;
};

export const useGetAdjustmentLogById = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.AdjustmentLog, id],
    queryFn: () => getAdjustmentLogById(id),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};
