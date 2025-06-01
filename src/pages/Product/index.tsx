import { useRoutes } from 'react-router-dom';
import ProductLayout from './components/ProductLayout';
import ProductList from './components/ProductList';
import ProductSku from './components/ProductSku';
import ProductSkuUpsert from './components/ProductSkuUpsert';
import ProductDetail from './components/ProductDetail';
import ProductUpsert from './components/ProductUpsert';
import ProductSkuDetail from './components/ProductSkuDetail';

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
          path: '/:id',
          element: <ProductDetail />,
        },
        // {
        //   path: '/:slug',
        //   element: <ProductSku />,
        // },
        {
          path: '/sku/:id',
          element: <ProductSkuDetail />,
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
