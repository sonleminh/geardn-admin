import { useRoutes } from 'react-router-dom';
import InventoryByProduct from './components/InventoryByProduct';
import InventoryLayout from './components/InventoryLayout';
import InventoryPage from './components/InventoryPage';
import InventoryImportPage from './components/InventoryExportPage';
import ExportPage from './components/InventoryExportPage/CreateInventoryExport';
import CreateInventoryImportPage from './components/InventoryImportPage/CreateInventoryImport';
import InventoryExportPage from './components/InventoryExportPage';
import CreateInventoryExportPage from './components/InventoryExportPage/CreateInventoryExport';
import InventoryAdjustmentPage from './components/InventoryAdjusmentPage';
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
