import * as React from 'react';
import { useEffect } from 'react';

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import {
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useAuthContext } from '@/contexts/AuthContext';
import { useLogoutMutate } from '@/services/auth';
// import { useNotifyStore } from '@/contexts/NotificationContext';
import {
  useGetNotifications,
  useGetStats,
  useMarkNotificationSeen,
} from '@/services/notification';
import { useNotifyStore } from '@/contexts/NotificationContext';
import ButtonWithTooltip from '@/components/ButtonWithTooltip';

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

  // Zustand store
  const { items, badge, isOpen, addMany, setOpen, resetBadge } =
    useNotifyStore();

  console.log('items', items);

  // API hooks
  const { data: notificationListData } = useGetNotifications();
  console.log('notificationListData', notificationListData);
  const { data: unreadCountData } = useGetStats(); // const markReadMutation = useMarkNotificationRead();
  const { mutate: markNotificationSeen } = useMarkNotificationSeen();

  // Get unread count from API instead of Zustand store
  const unreadCount = unreadCountData?.data?.count || 0;

  const [userAnchorEl, setUserAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElNotification, setAnchorElNotification] =
    React.useState<null | HTMLElement>(null);

  const openMenu = Boolean(userAnchorEl);
  const openMenuNotification = Boolean(anchorElNotification);

  // Sync API data with Zustand store (for notification list display)
  useEffect(() => {
    if (notificationListData?.data?.items) {
      addMany(notificationListData?.data?.items);
    }
  }, [notificationListData?.data?.items, addMany]);

  // useEffect(() => {
  //   const unread = unreadCountData?.data?.count ?? 0;
  //   const lastReadAtStr =
  //     unreadCountData?.data?.lastReadNotificationsAt ?? null;
  //   const serverLastReadAt = lastReadAtStr ? new Date(lastReadAtStr) : null;

  //   const lock = pendingBeforeRef.current;

  //   // Nếu đang reconcile và snapshot này cũ hơn mốc before => bỏ qua
  //   if (
  //     lock &&
  //     (!serverLastReadAt || serverLastReadAt.getTime() < lock.getTime())
  //   ) {
  //     return;
  //   }

  //   // Chấp nhận snapshot (và reset badgeDelta=0 trong store)
  //   setCounters({ unread, lastReadAt: serverLastReadAt });
  // }, [unreadCountData, setCounters]);
  // const totalBadge = badgeBase + badgeDelta;
  // console.log('totalBadge', totalBadge);

  const handleUserClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClickNotification = async (e) => {
    setAnchorElNotification(e.currentTarget);
    markNotificationSeen();
    resetBadge();
  };

  const handleClose = () => {
    setUserAnchorEl(null);
  };

  const handleCloseNotification = () => {
    setAnchorElNotification(null);
  };

  const handleLogout = () => {
    setUserAnchorEl(null);
    logoutMutation.mutate();
  };

  // const handleMarkRead = (id: string) => {
  //   markRead(id); // Update local state immediately
  //   markReadMutation.mutate(id); // Sync with API
  // };

  // const handleMarkAllRead = () => {
  //   markAllRead(); // Update local state immediately
  //   markAllReadMutation.mutate(); // Sync with API
  // };

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
          <Badge
            badgeContent={
              <Typography sx={{ color: '#fff', fontSize: 13 }}>
                {badge}
              </Typography>
            }
            color='primary'
            onClick={handleClickNotification}
            invisible={isOpen || badge === 0}
            sx={{
              mr: 2,
              '& .MuiBadge-badge': {
                top: 4,
                right: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 19,
                height: 19,
                backgroundColor: 'red',
                cursor: 'pointer',
              },
            }}>
            <NotificationsNoneOutlinedIcon
              sx={{ color: '#fff', fontSize: 28, cursor: 'pointer' }}
            />
          </Badge>

          <Menu
            id='notification-menu'
            anchorEl={anchorElNotification}
            open={openMenuNotification}
            onClose={handleCloseNotification}
            MenuListProps={{
              'aria-labelledby': 'notification-button',
            }}
            disableScrollLock={true}
            PaperProps={{
              sx: { width: 400, maxHeight: 500 },
            }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Typography variant='h6'>Thông báo</Typography>
                <Typography sx={{ fontSize: 13, color: '#4066cc' }}>
                  Đánh dấu tất cả là đã đọc
                </Typography>
                {/* {unreadCount > 0 && (
                  <Button
                    size='small'
                    onClick={handleMarkAllRead}
                    disabled={markAllReadMutation.isPending}>
                    {markAllReadMutation.isPending ? (
                      <CircularProgress size={16} />
                    ) : (
                      'Đánh dấu đã đọc'
                    )}
                  </Button>
                )} */}
              </Box>
            </Box>
            {items?.length === 0 ? (
              <MenuItem disabled>
                <Typography color='text.secondary'>
                  Không có thông báo
                </Typography>
              </MenuItem>
            ) : (
              items?.map((notification) => (
                <MenuItem
                  key={notification?.id}
                  sx={{
                    display: 'block',
                    py: 1.5,
                    px: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: notification?.read ? 400 : 600,
                            color: notification?.read
                              ? 'text.secondary'
                              : 'text.primary',
                          }}>
                          {notification?.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant='caption' color='text.secondary'>
                          {format(
                            new Date(notification?.createdAt),
                            'dd/MM/yyyy HH:mm',
                            { locale: vi }
                          )}
                        </Typography>
                      }
                    />
                    <ButtonWithTooltip
                      title='Đánh dấu đã đọc'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 24,
                        width: 24,
                        height: 24,
                        p: 0.5,
                        // backgroundColor: '#ccc',
                        borderRadius: '50%',
                        // ':hover': {
                        //   backgroundColor: '#ccc',
                        // },
                        '.icon-outline': { display: 'none' },
                        ':hover .icon-filled': { display: 'none' },
                        ':hover .icon-outline': { display: 'inline-flex' },
                      }}>
                      <CircleIcon
                        className='icon-filled'
                        sx={{ color: '#0064d1', fontSize: 12 }}
                      />
                      <RadioButtonUncheckedIcon
                        className='icon-outline'
                        sx={{ color: '#0064d1', fontSize: 12 }}
                      />
                    </ButtonWithTooltip>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>

          <IconButton onClick={handleUserClick}>
            <AccountCircleOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </IconButton>
          <Menu
            id='basic-menu'
            anchorEl={userAnchorEl}
            open={openMenu}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            disableScrollLock={true}>
            <MenuItem>{user?.name}</MenuItem>
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBarStyled>
  );
};

export default DashboardAppBar;
