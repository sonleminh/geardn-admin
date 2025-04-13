import { NavLink } from 'react-router-dom';

import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { IconButton, Link, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListItemButton from '@mui/material/ListItemButton';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MonitorIcon from '@mui/icons-material/Monitor';
import PaymentIcon from '@mui/icons-material/Payment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import StyleIcon from '@mui/icons-material/Style';
import ListItem from '@mui/material/ListItem';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

import LOGO from '@/assets/geardn-logo.png';

const menuList1 = [
  {
    link: '/dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    link: '/order',
    label: 'Đơn hàng',
    icon: <ShoppingBagOutlinedIcon />,
  },
  {
    link: '/',
    label: 'Kho hàng',
    icon: <WarehouseOutlinedIcon />,
  },
];

const menuList2 = [
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
    link: '/attribute-type',
    label: 'Loại thuộc tính',
    icon: <StyleIcon />,
  },
  {
    link: '/product-attribute',
    label: 'Phân loại',
    icon: <FilterAltOutlinedIcon />,
  },
  {
    link: '/payment',
    label: 'Thanh toán',
    icon: <PaymentIcon />,
  },
];

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const DashboardDrawer = ({
  open,
  handleDrawerToggle,
}: {
  open: boolean;
  handleDrawerToggle: () => void;
}) => {
  const theme = useTheme();

  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: '#000',
          color: '#fff',
          borderRight: '1px solid #434343',
        },
      }}
      variant='persistent'
      anchor='left'
      open={open}>
      <DrawerHeader sx={{ justifyContent: 'space-between' }}>
        <Link href='/' sx={{ ml: 1 }}>
          <Box
            sx={{
              height: 48,
              '.header-logo': {
                width: '120px',
                height: { xs: '48px' },
                objectFit: 'contain',
                borderRadius: 2,
                overflow: 'hidden',
              },
            }}>
            <img src={LOGO} alt='geardn' className='header-logo' />
          </Box>
        </Link>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
          {theme.direction === 'ltr' ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ bgcolor: '#434343' }} />
      <List>
        {menuList1?.map((item) => (
          <ListItem key={item?.label} sx={{ p: 0, m: '8px 0' }}>
            <Box
              component={NavLink}
              to={item?.link}
              sx={{
                width: '100%',
                color: '#eeeeee',
                justifyContent: 'start',
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 500,
                textDecoration: 'none',
                '&.active': {
                  background: '#3f3f3f',
                },
              }}>
              <ListItemButton>
                <ListItemIcon sx={{ color: '#fff' }}>{item?.icon}</ListItemIcon>
                <ListItemText primary={item?.label} />
              </ListItemButton>
            </Box>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ bgcolor: '#333333' }} />
      <List>
        {menuList2?.map((item) => (
          <ListItem key={item?.label} sx={{ p: 0, m: '8px 0' }}>
            <Box
              component={NavLink}
              to={item?.link}
              sx={{
                width: '100%',
                color: '#eeeeee',
                justifyContent: 'start',
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 500,
                textDecoration: 'none',
                '&.active': {
                  background: '#3f3f3f',
                },
              }}>
              <ListItemButton>
                <ListItemIcon sx={{ color: '#fff' }}>{item?.icon}</ListItemIcon>
                <ListItemText primary={item?.label} />
              </ListItemButton>
            </Box>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default DashboardDrawer;
