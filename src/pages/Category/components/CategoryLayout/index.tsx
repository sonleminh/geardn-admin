import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const CategoryLayout = () => {
  return (
    <>
      <Container maxWidth='xl'>
        <Outlet />
      </Container>
    </>
  );
};

export default CategoryLayout;
