import { useRoutes } from 'react-router-dom';

import StatisticLayout from './components/StatisticLayout';
import RevenueProfit from './components/RevenueProfit';
import Order from './components/OrderStats';
import UserStats from './components/UserStats';
import ProductStats from './components/ProductStats';

const Statistic = () => {
  const router = useRoutes([
    {
      path: '',
      element: <StatisticLayout />,
      children: [
        {
          path: '/revenue-profit',
          element: <RevenueProfit />,
          index: true,
        },
        {
          path: '/order',
          element: <Order />,
          index: true,
        },
        {
          path: '/user',
          element: <UserStats />,
          index: true,
        },
        {
          path: '/product',
          element: <ProductStats />,
          index: true,
        },
      ],
    },
  ]);
  return router;
};

export default Statistic;
