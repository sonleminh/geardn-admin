import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

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
