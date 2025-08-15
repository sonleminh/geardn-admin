import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

const AttributeValueLayout = () => {
  return (
    <>
      <Container maxWidth='xl'>
        <Outlet />
      </Container>
    </>
  );
};

export default AttributeValueLayout;
