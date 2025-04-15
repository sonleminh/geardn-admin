import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useRefreshToken, useWhoAmI } from '../services/auth';
import { useEffect } from 'react';
import LoadingBackdrop from '../components/LoadingBackdrop';
import { useNotificationContext } from '@/contexts/NotificationContext';
import Cookies from 'js-cookie';

const PrivateRoute = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { showNotification } = useNotificationContext();

  const { data, refetch: whoAmIRefetch, isFetching, isError } = useWhoAmI();
  const { data: refreshToken, refetch } = useRefreshToken();

  useEffect(() => {
    if (!isFetching) {
      if (data && !isError) {
        auth?.login(data?.data);
      } else if (isError) {
        refetch();
        if (refreshToken?.accessToken) {
          Cookies.set('access_token', refreshToken?.accessToken, { path: '/' });
          whoAmIRefetch();
        } else {
          navigate('/login');
        }
      } else {
        showNotification('Vui lòng đăng nhập!', 'info');
        navigate('/login');
      }
    }
  }, [data, isFetching, refreshToken]);
  return auth?.user ? <Outlet></Outlet> : <LoadingBackdrop />;
};

export default PrivateRoute;
