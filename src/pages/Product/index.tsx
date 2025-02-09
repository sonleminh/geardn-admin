import { useRoutes } from 'react-router-dom';
import ProductLayout from './components/ProductLayout';
import ProductList from './components/ProductList';
import ProductUpsert from './components/ProductUpsert';
import ProductInventory from './components/ProductInventory';
import ProductSkuUpsert from './components/ProductSkuUpsert';

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
          path: '/inventory/:id',
          element: <ProductInventory />,
          index: true,
        },
        {
          path: '/inventory/create/:id',
          element: <ProductSkuUpsert />,
          index: true,
        },
        {
          path: '/inventory/update/:id',
          element: <ProductSkuUpsert />,
          index: true,
        },
      ],
    },
  ]);
  return router;
};

export default Product;
