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
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useAuthContext } from '@/contexts/AuthContext';
import { useLogoutMutate } from '@/services/auth';
// import { useNotifyStore } from '@/contexts/NotificationContext';
import {
  useGetNotificationList,
  useGetUnreadCount,
  useMarkAllNotificationsRead,
} from '@/services/notification';
import { useNotifyStore } from '@/contexts/NotificationContext';

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
  const {
    items,
    addMany,
    setCounters,
    badgeBase,
    badgeDelta,
    lastReadAt,
    resetDelta,
    optimisticMarkAllRead,
  } = useNotifyStore();

  console.log('items', items);
  // console.log('user', user);
  console.log('badgeBase', badgeBase);
  console.log('badgeDelta', badgeDelta);
  console.log('badgeDelta', badgeDelta);

  // API hooks
  const { data: notifications, isLoading } = useGetNotificationList();
  const { data: unreadCountData, refetch: refetchUnreadCount } =
    useGetUnreadCount();
  const { mutate: markAllReadMutate } = useMarkAllNotificationsRead();
  // const markReadMutation = useMarkNotificationRead();
  // const markAllReadMutation = useMarkAllNotificationsRead();

  // Get unread count from API instead of Zustand store
  const unreadCount = unreadCountData?.data?.count || 0;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorElNotification, setAnchorElNotification] =
    React.useState<null | HTMLElement>(null);

  const openMenu = Boolean(anchorEl);
  const openMenuNotification = Boolean(anchorElNotification);

  // Sync API data with Zustand store (for notification list display)
  useEffect(() => {
    if (notifications?.data?.items) {
      addMany(notifications?.data?.items);
    }
  }, [notifications?.data?.items, addMany]);

  useEffect(() => {
    const unread = unreadCountData?.data?.count ?? 0;
    const lastReadAt = unreadCountData?.data?.lastReadNotificationsAt ?? null;
    setCounters({ unread, lastReadAt });
  }, [unreadCountData, setCounters]);

  const totalBadge = badgeBase + badgeDelta;
  console.log('totalBadge', totalBadge);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickNotification = (e) => {
    setAnchorElNotification(e.currentTarget);
    const before = notifications?.data?.cutoff; // hoặc lastItemCreatedAt
    if (!before) return;

    // backup để rollback khi lỗi
    const backup = { unread: badgeBase, lastReadAt };

    // optimistic ngay: badge = 0 tức thời
    optimisticMarkAllRead(before);

    markAllReadMutate(before, {
      onSuccess: async () => {
        await refetchUnreadCount(); // hoà giải: setCounters sẽ chạy lại ở useEffect
      },
      onError: () => {
        // khôi phục nếu BE fail
        setCounters(backup);
      },
    });
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
                {totalBadge}
              </Typography>
            }
            color='primary'
            onClick={handleClickNotification}
            invisible={totalBadge === 0}
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

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : items?.length === 0 ? (
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
                  <Box
                    sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                            color: notification.read
                              ? 'text.secondary'
                              : 'text.primary',
                          }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant='caption' color='text.secondary'>
                          {format(
                            new Date(notification.createdAt),
                            'dd/MM/yyyy HH:mm',
                            { locale: vi }
                          )}
                        </Typography>
                      }
                    />
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>

          <IconButton onClick={handleClick}>
            <AccountCircleOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />
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
            <MenuItem>{user?.name}</MenuItem>
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBarStyled>
  );
};

export default DashboardAppBar;
