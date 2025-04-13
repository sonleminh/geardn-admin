import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/constants/route';

import AdminLayout from '../layouts/AdminLayout';
import BaseLayout from '../layouts/BaseLayout';

import SuspenseLoader from '../components/SuspenseLoader';
import AttributeType from '@/pages/AttributeType';
import Attribute from '@/pages/ProductAttribute';
import PrivateRoute from './PrivateRoute';
import Dashboard from '@/pages/Dashboard';
import PublicRoute from './PublicRoute';
import Category from '@/pages/Category';
import Payment from '@/pages/Payment';
import Product from '@/pages/Product';
import Order from '@/pages/Order';

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
            path: ROUTES.LOGIN,
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
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          {
            path: `${ROUTES.DASHBOARD}`,
            element: <Dashboard />,
          },
          {
            path: `${ROUTES.PRODUCT}/*`,
            element: <Product />,
          },
          {
            path: `${ROUTES.CATEGORY}/*`,
            element: <Category />,
          },
          {
            path: `${ROUTES.ATTRIBUTE_TYPE}/*`,
            element: <AttributeType />,
          },
          {
            path: `${ROUTES.PRODUCT_ATTRIBUTE}/*`,
            element: <Attribute />,
          },
          {
            path: `${ROUTES.ORDER}/*`,
            element: <Order />,
          },
          {
            path: `${ROUTES.PAYMENT}/*`,
            element: <Payment />,
          },
        ],
      },
    ],
  },
];

export default routes;
