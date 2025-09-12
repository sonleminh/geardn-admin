import React from 'react';
import { NavLink } from 'react-router-dom';

import StoreMallDirectoryOutlinedIcon from '@mui/icons-material/StoreMallDirectoryOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import ManageHistoryOutlinedIcon from '@mui/icons-material/ManageHistoryOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payment';

import { LuPackageMinus, LuPackagePlus } from 'react-icons/lu';
import { BiCategory } from 'react-icons/bi';
import { TbHomeEdit } from 'react-icons/tb';
import { FiPackage } from 'react-icons/fi';

import { IconButton, Link, styled, useTheme } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

import MultipleListItem from '@/components/MultipleListItem';
import LOGO from '@/assets/geardn-logo.png';
import { ROUTES } from '@/constants/route';
import { DrawerMenuWrapper } from '../styled';

const menuList = [
  {
    item: (
      <MultipleListItem
        mainIcon={<AnalyticsOutlinedIcon />}
        mainLabel='Thống kê'
        active={location.pathname.includes('statistic')}
        options={[
          {
            to: ROUTES.STATISTIC_REVENUE_PROFIT,
            icon: <MonetizationOnOutlinedIcon />,
            label: 'Doanh thu',
          },
          {
            to: ROUTES.STATISTIC_ORDER,
            icon: <ShoppingBagOutlinedIcon />,
            label: 'Đơn hàng',
          },
          {
            to: ROUTES.STATISTIC_USER,
            icon: <AccountCircleOutlinedIcon />,
            label: 'Người dùng',
          },
          {
            to: ROUTES.STATISTIC_PRODUCT,
            icon: (
              <Box
                sx={{
                  svg: {
                    fontSize: 24,
                  },
                }}>
                <FiPackage />
              </Box>
            ),
            label: 'Sản phẩm',
          },
        ]}
      />
    ),
  },
  {
    item: (
      <MultipleListItem
        mainIcon={<ShoppingBagOutlinedIcon />}
        mainLabel='Quản lý đơn hàng'
        active={location.pathname.includes('order')}
        options={[
          {
            to: ROUTES.ORDER_LIST,
            icon: <ShoppingBagOutlinedIcon />,
            label: 'Đơn hàng',
          },
          {
            to: ROUTES.ORDER_STATUS_HISTORY,
            icon: <ManageHistoryOutlinedIcon />,
            label: 'Lịch sử cập nhật',
          },
          {
            to: ROUTES.ORDER_RETURN_REQUEST,
            icon: <UndoOutlinedIcon />,
            label: 'Hoàn trả đơn hàng',
          },
        ]}
      />
    ),
  },
  {
    item: (
      <MultipleListItem
        mainIcon={<Inventory2OutlinedIcon />}
        mainLabel='Quản lý tồn kho'
        active={location.pathname.includes('inventory')}
        options={[
          {
            to: ROUTES.INVENTORY_LIST,
            icon: <Inventory2OutlinedIcon />,
            label: 'Tồn kho',
          },
          {
            to: ROUTES.INVENTORY_IMPORT,
            icon: (
              <Box
                sx={{
                  svg: {
                    fontSize: 24,
                  },
                }}>
                <LuPackagePlus />
              </Box>
            ),
            label: 'Nhập kho',
          },
          {
            to: ROUTES.INVENTORY_EXPORT,
            icon: (
              <Box
                sx={{
                  svg: {
                    fontSize: 24,
                  },
                }}>
                <LuPackageMinus />
              </Box>
            ),
            label: 'Xuất kho',
          },
          {
            to: ROUTES.INVENTORY_ADJUSTMENT,
            icon: (
              <Box
                sx={{
                  svg: {
                    fontSize: 24,
                  },
                }}>
                <TbHomeEdit />
              </Box>
            ),
            label: 'Điều chỉnh',
          },
        ]}
      />
    ),
  },
  {
    item: (
      <ListItem>
        <ListItemButton component={NavLink} to={ROUTES.PRODUCT}>
          <ListItemIcon>
            <Box
              sx={{
                svg: {
                  fontSize: 24,
                },
              }}>
              <FiPackage />
            </Box>
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
            <Box
              sx={{
                fontSize: 24,
              }}>
              <BiCategory />
            </Box>
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
            icon: <StyleOutlinedIcon />,
            label: 'Loại thuộc tính',
          },
          {
            to: ROUTES.ATTRIBUTE_VALUE,
            icon: <LocalOfferOutlinedIcon />,
            label: 'Giá trị thuộc tính',
          },
        ]}
      />
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
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(171, 62, 62, 0.2)',
            borderRadius: '3px',
            transition: 'background 0.2s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(90, 90, 90) transparent',
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
                <ListItemIcon
                  sx={{
                    minWidth: { lg: 32, xl: 40 },
                    height: 24,
                    color: '#fff',
                  }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary={'Dashboard'} />
              </ListItemButton>
            </ListItem>
          }
          sx={{
            '.MuiListItemIcon-root': {
              minWidth: { lg: 36, xl: 40 },
            },
          }}>
          {menuList?.map((item, index) => (
            <React.Fragment key={index}>{item.item}</React.Fragment>
          ))}
        </List>
      </DrawerMenuWrapper>
    </Drawer>
  );
};

export default DashboardDrawer;
