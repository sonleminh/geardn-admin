import { useRoutes } from 'react-router-dom';
import PaymentLayout from './components/PaymentLayout';
import PaymentList from './components/PaymentList';
import PaymentUpsert from './components/PaymentUpsert';

const Payment = () => {
  const router = useRoutes([
    {
      path: '',
      element: <PaymentLayout />,
      children: [
        {
          path: '',
          element: <PaymentList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <PaymentUpsert />,
        },
        {
          path: '/create',
          element: <PaymentUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default Payment;
