import { useRoutes } from 'react-router-dom';

import AttributeTypeLayout from './components/AttributeTypeLayout';
import AttributeTypeUpsert from './components/AttributeTypeUpsert';
import AttributeTypeList from './components/AttributeTypeList';

const AttributeType = () => {
  const router = useRoutes([
    {
      path: '',
      element: <AttributeTypeLayout />,
      children: [
        {
          path: '',
          element: <AttributeTypeList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <AttributeTypeUpsert />,
        },
        {
          path: '/create',
          element: <AttributeTypeUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default AttributeType;
