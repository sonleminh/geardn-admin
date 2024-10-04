import { useRoutes } from 'react-router-dom';
import ProductSkuLayout from './components/ProductSkuLayout';
import ProductSkuList from './components/ProductSkuList';
import ProductSkuUpsert from './components/ProductSkuUpsert';

const ProductSku = () => {
  const router = useRoutes([
    {
      path: '',
      element: <ProductSkuLayout />,
      children: [
        {
          path: '',
          element: <ProductSkuList />,
          index: true,
        },
        {
          path: '/update/:id',
          element: <ProductSkuUpsert />,
        },
        {
          path: '/create',
          element: <ProductSkuUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default ProductSku;
