import { useRoutes } from 'react-router-dom';

import StatisticLayout from './components/StatisticLayout';
import RevenueProfit from './components/RevenueProfit';

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
      ],
    },
  ]);
  return router;
};

export default Statistic;
