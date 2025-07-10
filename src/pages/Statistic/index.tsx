import { useRoutes } from 'react-router-dom';
import StatisticLayout from './components/StatisticLayout';

const Statistic = () => {
  const router = useRoutes([
    {
      path: '',
      element: <StatisticLayout />,
      children: [
        {
          path: '',
          // element: <ProductList />,
          index: true,
        },
      ],
    },
  ]);
  return router;
};

export default Statistic;
