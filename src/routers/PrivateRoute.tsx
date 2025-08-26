import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useRefreshToken, useWhoAmI } from '../services/auth';
import { useEffect } from 'react';
import LoadingBackdrop from '../components/LoadingBackdrop';
import { useAlertContext } from '@/contexts/AlertContext';
import Cookies from 'js-cookie';

const PrivateRoute = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { showAlert } = useAlertContext();

  const { data, refetch: whoAmIRefetch, isFetching, isError } = useWhoAmI();
  const { data: refreshToken, refetch } = useRefreshToken();

  useEffect(() => {
    if (!isFetching) {
      if (data && !isError) {
        auth?.login({
          id: data?.data?.id,
          email: data?.data?.email,
          name: data?.data?.name,
          lastReadNotificationsAt: auth?.user?.lastReadNotificationsAt ?? null,
        });
      } else if (isError) {
        refetch();
        if (refreshToken?.accessToken) {
          Cookies.set('access_token', refreshToken?.accessToken, { path: '/' });
          whoAmIRefetch();
        } else {
          navigate('/login');
        }
      } else {
        showAlert('Vui lòng đăng nhập!', 'info');
        navigate('/login');
      }
    }
  }, [data, isFetching, refreshToken]);
  return auth?.user ? <Outlet></Outlet> : <LoadingBackdrop />;
};

export default PrivateRoute;
