import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

const AttributeTypeLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default AttributeTypeLayout;
