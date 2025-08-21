import { useNavigate } from 'react-router-dom';
import { useAlertContext } from '@/contexts/AlertContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { AxiosError } from 'axios';

import { axiosInstance } from '../axiosInstance';

import { ErrorResponse } from '@/interfaces/IError';
import {
  ILoginPayload,
  ILoginResponse,
  IRefreshTokenResponse,
} from '@/interfaces/IAuth';
import { ROUTES } from '@/constants/route';

const authUrl = 'admin/auth';

const loginApi = async (payload: ILoginPayload) => {
  const result = await axiosInstance.post(`${authUrl}/login`, payload);
  return result.data as ILoginResponse;
};

export const useLoginMutate = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { showAlert } = useAlertContext();

  return useMutation({
    mutationKey: ['user'],
    mutationFn: loginApi,
    onSuccess: (data) => {
      auth?.login(data?.data);
      showAlert('Đăng nhập thành công', 'success');
      navigate('/dashboard');
    },
    onError(error: AxiosError<ErrorResponse>) {
      showAlert(error?.response?.data?.message, 'error');
    },
  });
};

const logoutApi = async () => {
  const result = await axiosInstance.post(`${authUrl}/logout`, {});
  return result.data;
};

export const useLogoutMutate = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { showAlert } = useAlertContext();

  return useMutation({
    mutationKey: ['user'],
    mutationFn: logoutApi,
    onSuccess: () => {
      auth?.logout();
      showAlert('Đăng xuất thành công', 'success');
      navigate(ROUTES.LOGIN);
    },
  });
};

const whoAmI = async () => {
  const result = await axiosInstance.get(`${authUrl}/whoami`);
  return result.data as ILoginResponse;
};

export const useWhoAmI = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: whoAmI,
    refetchOnWindowFocus: false,
    retry: 0,
    gcTime: 0,
  });
};

export const refreshToken = async () => {
  const result = await axiosInstance.get(`${authUrl}/refresh-token`);
  return result.data as IRefreshTokenResponse;
};

export const useRefreshToken = () => {
  return useQuery({
    queryKey: ['refreshToken'],
    queryFn: refreshToken,
    enabled: false,
    refetchOnWindowFocus: false,
    retry: 0,
    gcTime: 0,
  });
};
