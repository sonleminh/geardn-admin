import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/constants/route';

import AdminLayout from '../layouts/AdminLayout';
import BaseLayout from '../layouts/BaseLayout';

import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

import SuspenseLoader from '../components/SuspenseLoader';

import AttributeValue from '@/pages/AttributeValue';
import Warehouse from '@/pages/Warehouse';
import Inventory from '@/pages/Inventory';
import Attribute from '@/pages/Attribute';
import Dashboard from '@/pages/Dashboard';
import Category from '@/pages/Category';
import Payment from '@/pages/Payment';
import Product from '@/pages/Product';
import Order from '@/pages/Order';
import Statistic from '@/pages/Statistic';

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
            path: `${ROUTES.ATTRIBUTE}/*`,
            element: <Attribute />,
          },
          {
            path: `${ROUTES.ATTRIBUTE_VALUE}/*`,
            element: <AttributeValue />,
          },
          {
            path: `${ROUTES.CATEGORY}/*`,
            element: <Category />,
          },
          {
            path: `${ROUTES.DASHBOARD}`,
            element: <Dashboard />,
          },
          {
            path: `${ROUTES.INVENTORY}/*`,
            element: <Inventory />,
          },
          {
            path: `${ROUTES.ORDER}/*`,
            element: <Order />,
          },
          {
            path: `${ROUTES.PAYMENT}/*`,
            element: <Payment />,
          },
          {
            path: `${ROUTES.PRODUCT}/*`,
            element: <Product />,
          },
          {
            path: `${ROUTES.STATISTIC}/*`,
            element: <Statistic />,
          },
          {
            path: `${ROUTES.WAREHOUSE}/*`,
            element: <Warehouse />,
          },

          {
            path: `*`,
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
];

export default routes;
