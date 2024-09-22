import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const ProductLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default ProductLayout;
