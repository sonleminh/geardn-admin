import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

const ProductAttributeLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default ProductAttributeLayout;
