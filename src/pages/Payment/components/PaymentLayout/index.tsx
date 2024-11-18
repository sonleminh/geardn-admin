import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const PaymentLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default PaymentLayout;
