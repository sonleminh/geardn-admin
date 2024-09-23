import { useRoutes } from 'react-router-dom';
import CategoryLayout from './components/CategoryLayout';
import CategoryList from './components/CategoryList';
import CategoryUpsert from './components/CategoryUpsert';

const Category = () => {
  const router = useRoutes([
    {
      path: '',
      element: <CategoryLayout />,
      children: [
        {
          path: '',
          element: <CategoryList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <CategoryUpsert />,
        },
        {
          path: '/create',
          element: <CategoryUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default Category;
