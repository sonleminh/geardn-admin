// import HeaderLogo from '../../../components/Header/HeaderLogo';
import { Box, Button, Divider, Link, List, ListItem } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { NavLink } from 'react-router-dom';
import MonitorIcon from '@mui/icons-material/Monitor';
import LOGO from '@/assets/geardn-logo.png';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

const Sidebar = () => {
  const menuList = [
    {
      link: '/dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      link: '/product',
      label: 'Sản phẩm',
      icon: <MonitorIcon />,
    },
    {
      link: '/category',
      label: 'Danh mục',
      icon: <ListAltIcon />,
    },
    {
      link: '/attribute',
      label: 'Phân loại',
      icon: <FilterAltOutlinedIcon />,
    },
  ];
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 260,
        height: '100%',
        bgcolor: 'black',
      }}>
      <Box
        sx={{
          my: 3,
          textAlign: 'center',
        }}>
        <Link
          href='/'
          sx={{
            '.header-logo': {
              width: '120px',
              height: { xs: '48px' },
              objectFit: 'contain',
              borderRadius: 2,
              overflow: 'hidden',
            },
          }}>
          <img src={LOGO} alt='geardn' className='header-logo' />
        </Link>
      </Box>
      <Divider sx={{ bgcolor: '#a1a1a1' }} />
      <List sx={{ mt: 2 }}>
        {menuList?.map((item, index) => (
          <ListItem key={index}>
            <Button
              disableRipple
              component={NavLink}
              to={item.link}
              startIcon={item.icon}
              sx={{
                width: '100%',
                color: '#eeeeee',
                justifyContent: 'start',
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 500,
                '&.active': {
                  color: '#000',
                  background: '#fff',
                },
              }}>
              {item.label}
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
