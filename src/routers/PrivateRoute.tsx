import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useWhoAmI } from '../services/auth';
import { useEffect } from 'react';
import LoadingBackdrop from '../components/LoadingBackdrop';
import { useNotificationContext } from '@/contexts/NotificationContext';

const PrivateRoute = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { showNotification } = useNotificationContext();

  const { data, isFetching, isError } = useWhoAmI();
  useEffect(() => {
    if (!isFetching) {
      if (data && !isError) {
        auth?.login(data);
      } else {
        showNotification('Vui lòng đăng nhập!', 'info');
        navigate('/login');
      }
    }
  }, [data, isFetching]);
  return auth?.user ? <Outlet></Outlet> : <LoadingBackdrop />;
};

export default PrivateRoute;
