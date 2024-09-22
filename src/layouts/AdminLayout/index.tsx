import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from '@/components/sharing/Sidebar';
import Footer from '@/components/sharing/Footer';

const AdminLayout = () => {
  return (
    <>
      <Header />
      <Box sx={{ mb: 3 }} />
      <Sidebar />
      <Box sx={{ ml: '260px' }}>
        <Box sx={{ minHeight: 'calc(100vh - 80px - 62.5px - 24px)' }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </>
  );
};

export default AdminLayout;
