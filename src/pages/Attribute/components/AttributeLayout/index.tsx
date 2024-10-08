import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AttributeLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default AttributeLayout;
