import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useWhoAmI } from '../services/auth';
import { useEffect } from 'react';
import LoadingBackdrop from '../components/LoadingBackdrop';

const PrivateRoute = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { data, isFetching, isError } = useWhoAmI();
  useEffect(() => {
    if (!isFetching) {
      if (data && !isError) {
        auth?.login(data);
      } else {
        navigate('/login');
      }
    }
  }, [data, isFetching]);
  return auth?.user ? <Outlet></Outlet> : <LoadingBackdrop />;
};

export default PrivateRoute;
