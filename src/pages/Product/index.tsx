import { useRoutes } from 'react-router-dom';
import ProductLayout from './components/ProductLayout';
import ProductList from './components/ProductList';
import ProductUpsert from './components/ProductUpsert';

const Product = () => {
  const router = useRoutes([
    {
      path: '',
      element: <ProductLayout />,
      children: [
        {
          path: '',
          element: <ProductList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <ProductUpsert />,
        },
        {
          path: '/create',
          element: <ProductUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default Product;
