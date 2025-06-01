import { useRoutes } from 'react-router-dom';
import ProductLayout from './components/ProductLayout';
import ProductList from './components/ProductList';
import ProductSku from './components/ProductSkuList';
import ProductSkuUpsert from './components/ProductSkuUpsert';
import ProductDetail from './components/ProductDetail';
import ProductUpsert from './components/ProductUpsert';
import ProductSkuDetail from './components/ProductSkuDetail';
import ProductSkuUpsert2 from './components/ProductSkuUpsert2';
import ProductSkuList from './components/ProductSkuList';

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
          path: '/:id/sku',
          element: <ProductSkuList />,
        },
        {
          path: '/sku/:id',
          element: <ProductSkuDetail />,
        },
        {
          path: '/sku/create/:id',
          element: <ProductSkuUpsert2 />,
        },
        {
          path: '/sku/update/:sku',
          element: <ProductSkuUpsert2 />,
        },
      ],
    },
  ]);
  return router;
};

export default Product;
