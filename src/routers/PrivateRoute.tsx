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
  const { data: rt, refetch } = useRefreshToken();

  useEffect(() => {
    if (!isFetching) {
      if (data && !isError) {
        auth?.login(data);
      } else if (isError) {
        refetch();
        if (rt?.accessToken) {
          Cookies.set('at', rt?.accessToken, { path: '/' });
          whoAmIRefetch();
        } else {
          navigate('/login');
        }
      } else {
        showNotification('Vui lòng đăng nhập!', 'info');
        navigate('/login');
      }
    }
  }, [data, isFetching, rt]);
  return auth?.user ? <Outlet></Outlet> : <LoadingBackdrop />;
};

export default PrivateRoute;
