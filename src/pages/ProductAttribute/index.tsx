import { useRoutes } from 'react-router-dom';

import ProductAttributeLayout from './components/ProductAttributeLayout';
import ProductAttributeUpsert from './components/ProductAttributeUpsert';
import ProductAttributeList from './components/ProductAttributeList';

const ProductAttribute = () => {
  const router = useRoutes([
    {
      path: '',
      element: <ProductAttributeLayout />,
      children: [
        {
          path: '',
          element: <ProductAttributeList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <ProductAttributeUpsert />,
        },
        {
          path: '/create',
          element: <ProductAttributeUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default ProductAttribute;
