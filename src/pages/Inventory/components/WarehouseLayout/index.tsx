import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

const WarehouseLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default WarehouseLayout;
