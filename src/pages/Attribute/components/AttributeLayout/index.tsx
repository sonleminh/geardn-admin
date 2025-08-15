import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

const AttributeLayout = () => {
  return (
    <>
      <Container maxWidth='xl'>
        <Outlet />
      </Container>
    </>
  );
};

export default AttributeLayout;
