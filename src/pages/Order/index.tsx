import { useRoutes } from 'react-router-dom';
import OrderLayout from './components/OrderLayout';
import OrderList from './components/OrderList';
import OrderUpsert from './components/OrderUpsert';
import OrderConfirm from './components/OrderConfirm';
import OrderUpdateHistoryList from './components/OrderUpdateHistoryList';
import OrderCancel from './components/OrderCancel';
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
          path: '/create',
          element: <OrderUpsert />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <OrderUpsert />,
          index: true,
        },
        {
          path: '/confirm/:id',
          element: <OrderConfirm />,
          index: true,
        },
        {
          path: '/update-history',
          element: <OrderUpdateHistoryList />,
          index: true,
        },
      ],
    },
  ]);
  return router;
};

export default Order;
