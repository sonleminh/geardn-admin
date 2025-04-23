import { useRoutes } from 'react-router-dom';
import WarehouseLayout from './components/WarehouseLayout';
import WarehouseUpsert from './components/WarehouseUpsert';
import WarehousePage from './components/WarehousePage';

const Warehouse = () => {
  const router = useRoutes([
    {
      path: '',
      element: <WarehouseLayout />,
      children: [
        {
          path: '',
          element: <WarehousePage />,
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
