import { useRoutes } from 'react-router-dom';

import AttributeValueLayout from './components/AttributeValueLayout';
import AttributeValueUpsert from './components/AttributeValueUpsert';
import AttributeValueList from './components/AttributeValueList';

const AttributeValue = () => {
  const router = useRoutes([
    {
      path: '',
      element: <AttributeValueLayout />,
      children: [
        {
          path: '',
          element: <AttributeValueList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <AttributeValueUpsert />,
        },
        {
          path: '/create',
          element: <AttributeValueUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default AttributeValue;
