import { useRoutes } from 'react-router-dom';
import OrderLayout from './components/OrderLayout';
import OrderList from './components/OrderList';
import OrderUpsert from './components/OrderUpsert';
import OrderConfirm from './components/OrderConfirm';
import OrderUpdateHistoryList from './components/OrderUpdateHistoryList';
import OrderReturnRequestList from './components/OrderReturnRequestList';
import OrderReturnRequestConfirm from './components/OrderReturnRequestConfirm';
import OrderDetail from './components/OrderDetail';
import OrderReturnRequestDetail from './components/OrderReturnRequestDetail';

const Order = () => {
  const router = useRoutes([
    {
      path: '',
      element: <OrderLayout />,
      children: [
        {
          path: '/list',
          element: <OrderList />,
          index: true,
        },
        {
          path: '/:id',
          element: <OrderDetail />,
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
          path: '/status-history',
          element: <OrderUpdateHistoryList />,
          index: true,
        },
        {
          path: '/return-request',
          element: <OrderReturnRequestList />,
          index: true,
        },
        {
          path: '/return-request/:id',
          element: <OrderReturnRequestDetail />,
          index: true,
        },
        {
          path: '/return-request/confirm/:id',
          element: <OrderReturnRequestConfirm />,
          index: true,
        },
      ],
    },
  ]);
  return router;
};

export default Order;
