import { useRoutes } from 'react-router-dom';
import InventoryByProduct from './components/InventoryByProduct';
import InventoryLayout from './components/InventoryLayout';
import InventoryPage from './components/InventoryPage';
import ImportPage from './components/ImportPage';
import ExportPage from './components/ExportPage';

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
        {
          path: '/export',
          element: <ExportPage />,
        },
        {
          path: '/adjustment',
          element: <ExportPage />,
        },
      ],
    },
  ]);
  return router;
};

export default Inventory;
