import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const StatisticLayout = () => {
  return (
    <>
      <Container maxWidth='lg'>
        <Outlet />
      </Container>
    </>
  );
};

export default StatisticLayout;
