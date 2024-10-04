import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const ProductSkuLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default ProductSkuLayout;
