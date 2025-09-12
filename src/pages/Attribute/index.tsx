import { useRoutes } from 'react-router-dom';

import AttributeLayout from './components/AttributeLayout';
import AttributeUpsert from './components/AttributeUpsert';
import AttributeList from './components/AttributeList';

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
      ],
    },
  ]);
  return router;
};

export default Attribute;
