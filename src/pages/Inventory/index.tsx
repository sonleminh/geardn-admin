import { useRoutes } from 'react-router-dom';
import InventoryByProduct from './components/InventoryByProduct';
import InventoryLayout from './components/InventoryLayout';
import InventoryPage from './components/InventoryPage';
import ImportPage from './components/ImportPage';

const Inventory = () => {
  const router = useRoutes([
    {
      path: '',
      element: <InventoryLayout />,
      children: [
        {
          path: '',
          element: <InventoryPage />,
        },
        {
          path: ':id/stocks',
          element: <InventoryByProduct />,
          index: true,
        },
        {
          path: '/import',
          element: <ImportPage />,
        },
      ],
    },
  ]);
  return router;
};

export default Inventory;
