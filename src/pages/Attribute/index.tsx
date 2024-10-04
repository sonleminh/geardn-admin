import { useRoutes } from 'react-router-dom';
import AttributeLayout from './components/AttributeLayout';
import AttributeList from './components/AttributeList';
import AttributeUpsert from './components/AttributeUpsert';

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
