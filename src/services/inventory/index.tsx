import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { QueryKeys } from '@/constants/query-key';

import {
  IWarehouse,
  ICreateWarehouse,
  IUpdateWarehousePayload,
} from '@/interfaces/IWarehouse';
import { ICreateImportLog } from '@/interfaces/IImportLog';
import { ICreateExportLog } from '@/interfaces/IExportLog';
import { ICreateAdjustmentLog } from '@/interfaces/IAdjustmentLog';
type TWarehousesRes = {
  success: boolean;
  message: string;
  data: IWarehouse[];
  total: number;
};

type TWarehouseById = {
  status: number;
  message: string;
  data: IWarehouse;
};

const importLogUrl = '/import-logs';
const exportLogUrl = '/export-logs';
const adjustmentLogUrl = '/adjustment-logs';

const createImportLog = async (payload: ICreateImportLog) => {
  const result = await axiosInstance.post(importLogUrl, payload);
  return result.data;
};

export const useCreateImportLog = () => {
  return useMutation({
    mutationFn: createImportLog,
  });
};

const createExportLog = async (payload: ICreateExportLog) => {
  const result = await axiosInstance.post(exportLogUrl, payload);
  return result.data;
};

export const useCreateExportLog = () => {
  return useMutation({
    mutationFn: createExportLog,
  });
};

const createAdjustmentLog = async (payload: ICreateAdjustmentLog) => {
  const result = await axiosInstance.post(adjustmentLogUrl, payload);
  return result.data;
};

export const useCreateAdjustmentLog = () => {
  return useMutation({
    mutationFn: createAdjustmentLog,
  });
};
