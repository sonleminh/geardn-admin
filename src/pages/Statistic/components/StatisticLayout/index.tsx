import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

const StatisticLayout = () => {
  return (
    <>
      <Container maxWidth='xl'>
        <Outlet />
      </Container>
    </>
  );
};

export default StatisticLayout;
