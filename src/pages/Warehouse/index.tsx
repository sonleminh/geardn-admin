import { useRoutes } from 'react-router-dom';
import WarehouseLayout from './components/WarehouseLayout';
import WarehouseUpsert from './components/WarehouseUpsert';
import WarehouseList from './components/WarehouseList';

const Warehouse = () => {
  const router = useRoutes([
    {
      path: '',
      element: <WarehouseLayout />,
      children: [
        {
          path: '',
          element: <WarehouseList />,
        },
        {
          path: '/update/:id',
          element: <WarehouseUpsert />,
        },
        {
          path: '/create',
          element: <WarehouseUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default Warehouse;
