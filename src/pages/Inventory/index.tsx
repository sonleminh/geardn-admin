import { useRoutes } from 'react-router-dom';
import InventoryLayout from './components/InventoryLayout';
import InventoryList from './components/InventoryList';
import InventoryCategoryList from './components/InventoryCategoryList';
import InventoryModelUpsert from './components/InventoryModelUpsert';
import InventoryModelList from './components/InventoryModelList';

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
          path: '/model/:id',
          element: <InventoryModelList />,
          index: true,
        },
        {
          path: '/model/create/:id',
          element: <InventoryModelUpsert />,
          index: true,
        },
        {
          path: '/model/update/:id',
          element: <InventoryModelUpsert />,
          index: true,
        },
      ],
    },
  ]);
  return router;
};

export default Inventory;
