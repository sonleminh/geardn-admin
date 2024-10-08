import { useRoutes } from 'react-router-dom';
import InventoryLayout from './components/InventoryLayout';
import InventoryList from './components/InventoryList';
import InventoryUpsert from './components/InventoryUpsert';

const Inventory = () => {
  const router = useRoutes([
    {
      path: '',
      element: <InventoryLayout />,
      children: [
        {
          path: '',
          element: <InventoryList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <InventoryUpsert />,
        },
        {
          path: '/create',
          element: <InventoryUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default Inventory;
