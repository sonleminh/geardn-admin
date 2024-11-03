import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const OrderLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default OrderLayout;
