import { Outlet, useNavigate } from 'react-router-dom';
import { useWhoAmI } from '../services/auth';
import { useAuthContext } from '../contexts/AuthContext';
import { useEffect } from 'react';
import LoadingBackdrop from '../components/LoadingBackdrop';
const PublicRoute = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { data, isFetching, isError } = useWhoAmI();
  useEffect(() => {
    if (!isFetching && !isError) {
      if (data) {
        navigate('dashboard');
      }
    }
  }, [data, isFetching, isError]);

  return !auth?.user ? <Outlet /> : <LoadingBackdrop />;
};

export default PublicRoute;
