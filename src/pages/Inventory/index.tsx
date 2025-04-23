import { useRoutes } from 'react-router-dom';
import WarehouseLayout from './components/WarehouseLayout';
import WarehouseList from './components/WarehouseList';
import WarehouseUpsert from './components/WarehouseUpsert';
import StockList from './components/InventoryPage';
import ImportPage from './components/ImportPage';
import StockByProduct from './components/StockByProduct';

const Inventory = () => {
  const router = useRoutes([
    {
      path: '',
      element: <WarehouseLayout />,
      children: [
        {
          path: '',
          element: <InventoryPage />,
        },
        {
          path: ':id/stocks',
          element: <StockByProduct />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <WarehouseUpsert />,
        },
        {
          path: '/create',
          element: <WarehouseUpsert />,
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
