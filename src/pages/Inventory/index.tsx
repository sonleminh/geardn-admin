import { useRoutes } from 'react-router-dom';
import InventoryLayout from './components/InventoryLayout';
import InventoryList from './components/InventoryList';
import InventoryUpsert from './components/InventoryUpsert';
import InventoryCategoryList from './components/InventoryCategoryList';
import InventorySkuList from './components/InventorySkuList';

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
          path: '/product/:id',
          element: <InventorySkuList />,
          index: true,
        },
      ],
    },
  ]);
  return router;
};

export default Inventory;
