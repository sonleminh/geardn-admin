import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { getRequest, postRequest } from '../axios';
import { AxiosError } from 'axios';

import { ILoginResponse, IUser } from '@/interfaces/IUser';
import { ILoginPayload } from '@/interfaces/ILogin';
import { ErrorResponse } from '@/interfaces/IError';

const authUrl = 'auth';

const loginApi = async (payload: ILoginPayload) => {
  const result = await postRequest(`admin/${authUrl}/login`, payload);
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
      auth?.login(data);
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
  const result = await getRequest<IUser>(`${authUrl}/whoami`);
  return result.data;
};

export const useWhoAmI = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: whoAmI,
    refetchOnWindowFocus: false,
    // refetchOnMount: false,
    // refetchInterval: false,
    retry: 0,
    gcTime: 0,
    // throwOnError: ,
  });
};
