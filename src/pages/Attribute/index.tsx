import { useRoutes } from 'react-router-dom';

import AttributeLayout from './components/AttributeLayout';
import AttributeUpsert from './components/AttributeUpsert';
import AttributeList from './components/AttributeList';
import Notification from './components/Notification';

const Attribute = () => {
  const router = useRoutes([
    {
      path: '',
      element: <AttributeLayout />,
      children: [
        {
          path: '',
          element: <AttributeList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <AttributeUpsert />,
        },
        {
          path: '/create',
          element: <AttributeUpsert />,
        },
        {
          path: '/notification',
          element: <Notification />,
        },
      ],
    },
  ]);
  return router;
};

export default Attribute;
