import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const InventoryLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default InventoryLayout;
