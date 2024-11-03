import { useRoutes } from 'react-router-dom';
import OrderLayout from './components/OrderLayout';
import OrderList from './components/OrderList';
// import OrderLayout from './components/OrderLayout';
// import OrderList from './components/OrderList';
// import OrderCategoryList from './components/OrderCategoryList';
// import OrderModelUpsert from './components/OrderModelUpsert';
// import OrderModelList from './components/OrderModelList';

const Order = () => {
  const router = useRoutes([
    {
      path: '',
      element: <OrderLayout />,
      children: [
        {
          path: '',
          element: <OrderList />,
          index: true,
        },
        {
          path: '/order/:id',
          element: <OrderList />,
          index: true,
        },
        // {
        //   path: '/model/create',
        //   element: <OrderModelUpsert />,
        //   index: true,
        // },
        // {
        //   path: '/model/update/:id',
        //   element: <OrderModelUpsert />,
        //   index: true,
        // },
      ],
    },
  ]);
  return router;
};

export default Order;
