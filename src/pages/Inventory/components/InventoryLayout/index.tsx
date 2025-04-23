import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

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
