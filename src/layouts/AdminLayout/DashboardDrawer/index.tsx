import { NavLink } from 'react-router-dom';

import StoreMallDirectoryOutlinedIcon from '@mui/icons-material/StoreMallDirectoryOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MonitorIcon from '@mui/icons-material/Monitor';
import PaymentIcon from '@mui/icons-material/Payment';
import StyleIcon from '@mui/icons-material/Style';

import { IconButton, Link, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';

import MultipleListItem from '@/components/MultipleListItem';
import { ROUTES } from '@/constants/route';
import React from 'react';
import { DrawerMenuWrapper } from '../styled';
import LOGO from '@/assets/geardn-logo.png';

const menuList = [
  {
    item: (
      <ListItem>
        <ListItemButton component={NavLink} to={ROUTES.ORDER}>
          <ListItemIcon>
            <ShoppingBagOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Đơn hàng'} />
        </ListItemButton>
      </ListItem>
    ),
  },
  {
    item: (
      <ListItem>
        <ListItemButton component={NavLink} to={ROUTES.INVENTORY}>
          <ListItemIcon>
            <WarehouseOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Tồn kho'} />
        </ListItemButton>
      </ListItem>
    ),
  },
  {
    item: (
      <ListItem>
        <ListItemButton component={NavLink} to={ROUTES.WAREHOUSE}>
          <ListItemIcon>
            <StoreMallDirectoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Kho hàng'} />
        </ListItemButton>
      </ListItem>
    ),
  },
  {
    item: (
      <ListItem>
        <ListItemButton component={NavLink} to={ROUTES.PRODUCT}>
          <ListItemIcon>
            <MonitorIcon />
          </ListItemIcon>
          <ListItemText primary={'Sản phẩm'} />
        </ListItemButton>
      </ListItem>
    ),
  },
  {
    item: (
      <ListItem>
        <ListItemButton component={NavLink} to={ROUTES.CATEGORY}>
          <ListItemIcon>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary={'Danh mục'} />
        </ListItemButton>
      </ListItem>
    ),
  },
  {
    item: (
      <MultipleListItem
        mainIcon={<FilterAltOutlinedIcon />}
        mainLabel='Phân loại'
        active={location.pathname.includes('attribute')}
        options={[
          {
            to: ROUTES.ATTRIBUTE,
            icon: <StyleIcon />,
            label: 'Loại thuộc tính',
          },
          {
            to: ROUTES.ATTRIBUTE_VALUE,
            icon: <LocalOfferIcon />,
            label: 'Giá trị thuộc tính',
          },
        ]}
      />
    ),
  },
  {
    item: (
      <ListItem>
        <ListItemButton component={NavLink} to={ROUTES.PAYMENT}>
          <ListItemIcon>
            <PaymentIcon />
          </ListItemIcon>
          <ListItemText primary={'Thanh toán'} />
        </ListItemButton>
      </ListItem>
    ),
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

  console.log('attribute', location.pathname.includes('attribute'));
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
      <DrawerMenuWrapper>
        <List
          subheader={
            <ListItem sx={{ p: 0, m: '8px 0' }}>
              <ListItemButton
                component={NavLink}
                to='/'
                sx={{
                  justifyContent: 'start',
                  width: '100%',
                  fontSize: 14,
                  fontWeight: 600,
                  background: location.pathname.includes('/dashboard')
                    ? '#333'
                    : '',
                  ':hover': {
                    bgcolor: '#333',
                  },
                }}>
                <ListItemIcon sx={{ color: '#fff' }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary={'Dashboard'} />
              </ListItemButton>
            </ListItem>
          }>
          {menuList?.map((item, index) => (
            <React.Fragment key={index}>{item.item}</React.Fragment>
          ))}
        </List>
      </DrawerMenuWrapper>
    </Drawer>
  );
};

export default DashboardDrawer;
