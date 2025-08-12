import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

const InventoryLayout = () => {
  return (
    <>
      <Container maxWidth='xl'>
        <Outlet />
      </Container>
    </>
  );
};

export default InventoryLayout;
