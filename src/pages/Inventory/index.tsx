import { useRoutes } from 'react-router-dom';

import InventoryList from './components/InventoryList';
import InventoryLayout from './components/InventoryLayout';
import InventoryByProduct from './components/InventoryByProduct';

import InventoryImportPage from './components/InventoryImportList';
import InventoryExportList from './components/InventoryExportList';
import InventoryAdjustmentPage from './components/InventoryAdjusmentList';

import CreateInventoryImportPage from './components/InventoryImportList/CreateInventoryImport';
import CreateInventoryExportPage from './components/InventoryExportList/CreateInventoryExport';
import CreateInventoryAdjustmentPage from './components/InventoryAdjusmentList/CreateInventoryAdjustment';

const Inventory = () => {
  const router = useRoutes([
    {
      path: '',
      element: <InventoryLayout />,
      children: [
        {
          path: 'list',
          element: <InventoryList />,
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
          element: <InventoryExportList />,
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
