import { useRoutes } from 'react-router-dom';
import InventoryByProduct from './components/InventoryByProduct';
import InventoryLayout from './components/InventoryLayout';
import InventoryPage from './components/InventoryPage';
import InventoryImportPage from './components/InventoryImportPage';
import ExportPage from './components/InventoryExportPage';
import CreateInventoryImportPage from './components/InventoryImportPage/CreateInventoryImport';

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
          element: <InventoryImportPage />,
        },
        {
          path: '/import/create',
          element: <CreateInventoryImportPage />,
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
