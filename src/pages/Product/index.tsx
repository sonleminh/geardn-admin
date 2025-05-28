import { useRoutes } from 'react-router-dom';
import ProductLayout from './components/ProductLayout';
import ProductList from './components/ProductList';
import ProductSku from './components/ProductSku';
import ProductSkuUpsert from './components/ProductSkuUpsert';
import ProductUpsert from './components/ProductUpsert';
import ProductDetailPage from './components/Product';

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
          path: '/create',
          element: <ProductUpsert />,
        },
        {
          path: '/update/:id',
          element: <ProductUpsert />,
        },
        {
          path: '/:slug',
          element: <ProductDetailPage />,
        },
        // {
        //   path: '/:slug',
        //   element: <ProductSku />,
        // },
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
