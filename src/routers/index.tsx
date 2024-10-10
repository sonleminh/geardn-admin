import AdminLayout from '../layouts/AdminLayout';
import BaseLayout from '../layouts/BaseLayout';
import { Suspense, lazy } from 'react';
import SuspenseLoader from '../components/SuspenseLoader';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Product from '@/pages/Product';
import Category from '@/pages/Category';
import Attribute from '@/pages/Attribute';
import ProductSku from '@/pages/ProductSku';
import Inventory from '@/pages/Inventory';

const Loader =
  <P extends object>(Component: React.ComponentType<P>): React.FC<P> =>
  (props: P) =>
    (
      <Suspense fallback={<SuspenseLoader />}>
        <Component {...props} />
      </Suspense>
    );

const Login = Loader(lazy(() => import('../pages/Login')));
// const Dashboard = Loader(lazy(() => import('../pages/Dashboard')));
// const Product = Loader(lazy(() => import('../pages/Product')));
// const Tag = Loader(lazy(() => import('../pages/Tag')));

const routes = [
  {
    element: <PublicRoute />,
    children: [
      {
        element: <BaseLayout />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to={'/dashboard'} replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'product/*',
            element: <Product />,
          },
          {
            path: 'category/*',
            element: <Category />,
          },
          {
            path: 'attribute/*',
            element: <Attribute />,
          },
          {
            path: 'product-sku/*',
            element: <ProductSku />,
          },
          {
            path: 'inventory/*',
            element: <Inventory />,
          },
        ],
      },
    ],
  },
];

export default routes;
