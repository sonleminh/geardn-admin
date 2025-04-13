import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { getRequest, postRequest } from '../axios';
import { AxiosError } from 'axios';

import { IUser } from '@/interfaces/IUser';
import { ErrorResponse } from '@/interfaces/IError';
import {
  ILoginPayload,
  ILoginResponse,
  IRefreshTokenResponse,
} from '@/interfaces/IAuth';

const authUrl = 'admin/auth';

const loginApi = async (payload: ILoginPayload) => {
  const result = await postRequest(`${authUrl}/login`, payload);
  return result.data as ILoginResponse;
};

export const useLoginMutate = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { showNotification } = useNotificationContext();

  return useMutation({
    mutationKey: ['user'],
    mutationFn: loginApi,
    onSuccess: (data) => {
      auth?.login(data?.data);
      showNotification('Đăng nhập thành công', 'success');
      navigate('/dashboard');
    },
    onError(error: AxiosError<ErrorResponse>) {
      showNotification(error?.response?.data?.message, 'error');
    },
  });
};

const logoutApi = async () => {
  const result = await postRequest(`${authUrl}/logout`, {});
  return result.data;
};

export const useLogoutMutate = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { showNotification } = useNotificationContext();

  return useMutation({
    mutationKey: ['user'],
    mutationFn: logoutApi,
    onSuccess: () => {
      auth?.logout();
      showNotification('Đăng xuất thành công', 'success');
      navigate('/login');
    },
  });
};

const whoAmI = async () => {
  const result = await getRequest(`${authUrl}/whoami`);
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
  const result = await getRequest(`${authUrl}/refresh-token`);
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
