import { useRoutes } from 'react-router-dom';

import InventoryPage from './components/InventoryPage';
import InventoryLayout from './components/InventoryLayout';
import InventoryByProduct from './components/InventoryByProduct';

import InventoryImportPage from './components/InventoryImportPage';
import InventoryExportPage from './components/InventoryExportPage';
import InventoryAdjustmentPage from './components/InventoryAdjusmentPage';

import CreateInventoryImportPage from './components/InventoryImportPage/CreateInventoryImport';
import CreateInventoryExportPage from './components/InventoryExportPage/CreateInventoryExport';
import CreateInventoryAdjustmentPage from './components/InventoryAdjusmentPage/CreateInventoryAdjustment';

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
          element: <InventoryExportPage />,
        },
        {
          path: '/export/create',
          element: <CreateInventoryExportPage />,
        },
        {
          path: '/adjustment',
          element: <InventoryAdjustmentPage />,
        },
        {
          path: '/adjustment/create',
          element: <CreateInventoryAdjustmentPage />,
        },
      ],
    },
  ]);
  return router;
};

export default Inventory;
