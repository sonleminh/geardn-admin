import { Outlet, useNavigate } from 'react-router-dom';
import { useRefreshToken, useWhoAmI } from '../services/auth';
import { useAuthContext } from '../contexts/AuthContext';
import { useEffect } from 'react';
import LoadingBackdrop from '../components/LoadingBackdrop';
import Cookies from 'js-cookie';

const PublicRoute = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { data, refetch: whoAmIRefetch, isFetching, isError } = useWhoAmI();
  const { data: rt, refetch } = useRefreshToken();

  useEffect(() => {
    if (!isFetching && !isError) {
      if (data) {
        navigate('dashboard');
      }
    }
    if (isError) {
      refetch();
      if (rt?.accessToken) {
        Cookies.set('at', rt?.accessToken, { path: '/' });
        whoAmIRefetch();
        navigate('dashboard');
      }
    }
  }, [data, isFetching, isError, rt]);

  return !auth?.user ? <Outlet /> : <LoadingBackdrop />;
};

export default PublicRoute;
