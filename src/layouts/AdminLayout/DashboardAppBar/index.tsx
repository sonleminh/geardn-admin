import * as React from 'react';

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

import { useAuthContext } from '@/contexts/AuthContext';
import { useLogoutMutate } from '@/services/auth';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBarStyled = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - 240px)`,
        marginLeft: `240px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DashboardAppBar = ({
  open,
  handleDrawerToggle,
}: {
  open: boolean;
  handleDrawerToggle: () => void;
}) => {
  const { user } = useAuthContext();
  const logoutMutation = useLogoutMutate();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorElNotification, setAnchorElNotification] =
    React.useState<null | HTMLElement>(null);

  const openMenu = Boolean(anchorEl);
  const openMenuNotification = Boolean(anchorElNotification);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickNotification = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElNotification(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseNotification = () => {
    setAnchorElNotification(null);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <AppBarStyled position='fixed' open={open}>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <IconButton
          onClick={handleDrawerToggle}
          edge='start'
          sx={[
            {
              mr: 2,
              color: '#fff',
            },
            open && { display: 'none' },
          ]}>
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <IconButton onClick={handleClickNotification}>
            <NotificationsNoneOutlinedIcon sx={{ color: '#fff' }} />
          </IconButton>
          <Menu
            id='basic-menu'
            anchorEl={anchorElNotification}
            open={openMenuNotification}
            onClose={handleCloseNotification}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            disableScrollLock={true}>
            <MenuItem>Thông báo 1</MenuItem>
            <MenuItem>Thông báo 2</MenuItem>
            <MenuItem>Thông báo 3</MenuItem>
          </Menu>
          <IconButton onClick={handleClick}>
            <AccountCircleOutlinedIcon sx={{ color: '#fff' }} />
          </IconButton>
          <Menu
            id='basic-menu'
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            disableScrollLock={true}>
            <MenuItem>{user?.name}c</MenuItem>
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBarStyled>
  );
};

export default DashboardAppBar;
