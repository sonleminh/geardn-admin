import { useRoutes } from 'react-router-dom';
import InventoryLayout from './components/InventoryLayout';
import InventoryList from './components/InventoryList';
import InventoryUpsert from './components/InventoryUpsert';
import InventoryCategoryList from './components/InventoryCategoryList';
import InventorySkuList from './components/InventorySkuList';
import InventorySkuUpsert from './components/InventorySkuUpsert';

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
          path: '/category/:id',
          element: <InventoryCategoryList />,
          index: true,
        },
        {
          path: '/sku/:id',
          element: <InventorySkuList />,
          index: true,
        },
        {
          path: '/sku/create',
          element: <InventorySkuUpsert />,
          index: true,
        },
        {
          path: '/sku/update/:id',
          element: <InventorySkuUpsert />,
          index: true,
        },
      ],
    },
  ]);
  return router;
};

export default Inventory;
