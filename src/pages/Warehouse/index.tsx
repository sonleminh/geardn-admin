import { useRoutes } from 'react-router-dom';
import WarehouseLayout from './components/WarehouseLayout';
import WarehouseList from './components/WarehouseList';
import WarehouseUpsert from './components/WarehouseUpsert';
import StockList from './components/StockList';

const Warehouse = () => {
  const router = useRoutes([
    {
      path: '',
      element: <WarehouseLayout />,
      children: [
        {
          path: '',
          element: <WarehouseList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <WarehouseUpsert />,
        },
        {
          path: '/create',
          element: <WarehouseUpsert />,
        },
        {
          path: '/:id',
          element: <StockList />,
        },
      ],
    },
  ]);
  return router;
};

export default Warehouse;
