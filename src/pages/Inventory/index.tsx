import { useRoutes } from 'react-router-dom';

import InventoryList from './components/InventoryList';
import InventoryLayout from './components/InventoryLayout';
import InventoryByProduct from './components/InventoryByProduct';

import InventoryExportList from './components/InventoryExport';
import InventoryAdjustment from './components/InventoryAdjustment';

import CreateInventoryImport from './components/InventoryImport/CreateInventoryImport';
import CreateInventoryExport from './components/InventoryExport/CreateInventoryExport';
import CreateInventoryAdjustment from './components/InventoryAdjustment/CreateInventoryAdjustment';
import InventoryImportList from './components/InventoryImport';
import InventoryImportDetail from './components/InventoryImport/InventoryImportDetail';
import InventoryExportDetail from './components/InventoryExport/InventoryExportDetail';
import InventoryAdjustmentDetail from './components/InventoryAdjustment/InventoryAdjustmentDetail';

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
          element: <InventoryImportList />,
        },
        {
          path: '/import/:id',
          element: <InventoryImportDetail />,
        },
        {
          path: '/import/create',
          element: <CreateInventoryImport />,
        },
        {
          path: '/export',
          element: <InventoryExportList />,
        },
        {
          path: '/export/:id',
          element: <InventoryExportDetail />,
        },
        {
          path: '/export/create',
          element: <CreateInventoryExport />,
        },
        {
          path: '/adjustment',
          element: <InventoryAdjustment />,
        },
        {
          path: '/adjustment/:id',
          element: <InventoryAdjustmentDetail />,
        },
        {
          path: '/adjustment/create',
          element: <CreateInventoryAdjustment />,
        },
      ],
    },
  ]);
  return router;
};

export default Inventory;
