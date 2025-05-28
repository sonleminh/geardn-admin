import { useRoutes } from 'react-router-dom';
import ProductLayout from './components/ProductLayout';
import ProductList from './components/ProductList';
import ProductSku from './components/ProductSku';
import ProductSkuUpsert from './components/ProductSkuUpsert';
import ProductUpsert from './components/ProductUpsert';
import ProductList2 from './components/ProductList2';

const Product = () => {
  const router = useRoutes([
    {
      path: '',
      element: <ProductLayout />,
      children: [
        {
          path: '',
          element: <ProductList2 />,
          index: true,
        },
        {
          path: '/create',
          element: <ProductUpsert />,
        },
        {
          path: '/update/:id',
          element: <ProductUpsert />,
        },
        {
          path: '/:slug',
          element: <ProductSku />,
        },
        {
          path: '/sku/create/:sku',
          element: <ProductSkuUpsert />,
        },
        {
          path: '/sku/update/:sku',
          element: <ProductSkuUpsert />,
        },
      ],
    },
  ]);
  return router;
};

export default Product;
