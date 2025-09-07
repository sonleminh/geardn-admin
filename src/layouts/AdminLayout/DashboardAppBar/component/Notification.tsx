import * as React from 'react';

import CircleIcon from '@mui/icons-material/Circle';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Badge,
  Box,
  Button,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import ButtonWithTooltip from '@/components/ButtonWithTooltip';
import { useNotifyStore } from '@/contexts/NotificationContext';
import {
  useGetNotifications,
  useGetStats,
  useMarkAllRead,
  useMarkNotificationSeen,
  useMarkNotificationsRead,
  useNotiInfinite,
} from '@/services/notification';

const Notification = () => {
  const {
    items,
    badge,
    isOpen,
    addMany,
    setOpen,
    resetBadge,
    markReadLocal,
    markAllReadLocal,
  } = useNotifyStore();

  const { data: notificationListData } = useGetNotifications();
  const { data: statsData, refetch: refetchStats } = useGetStats();
  const markNotificationSeenMutation = useMarkNotificationSeen();
  const markNotificationsReadMutation = useMarkNotificationsRead();
  const markAllAsReadMutation = useMarkAllRead();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useNotiInfinite();
  //   const notiItems = data ? data?.pages?.flatMap((p) => p.items) : [];

  const containerRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const [anchorElNotification, setAnchorElNotification] =
    React.useState<null | HTMLElement>(null);

  const openMenuNotification = Boolean(anchorElNotification);

  // Sync API data with Zustand store (for notification list display)
  React.useEffect(() => {
    if (notificationListData?.data?.items) {
      addMany(notificationListData?.data?.items);
    }
  }, [notificationListData?.data?.items, addMany]);

  //   if (status === 'pending') return <div className='p-3'>Đang tải…</div>;
  //   if (status === 'error') return <div className='p-3'>Lỗi tải dữ liệu</div>;

  const handleOpenNotification = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElNotification(e.currentTarget);
    markNotificationSeenMutation.mutate();
    resetBadge();
    setOpen(true);
  };

  const handleMarkRead = (id: string) => {
    // Update local state immediately for better UX
    markReadLocal([id]);

    // Call API to sync with server
    markNotificationsReadMutation.mutate([id], {
      onSuccess: () => {
        console.log('Notification marked as read successfully');
      },
      onError: (error: Error) => {
        console.error('Failed to mark notification as read:', error);
        // Optionally revert local state on error
      },
    });
  };

  const handleMarkReadAll = () => {
    markAllAsReadMutation.mutate();
    markAllReadLocal();
    refetchStats();
  };

  const handleCloseNotification = () => {
    setAnchorElNotification(null);
  };

  return (
    <>
      <Badge
        badgeContent={
          <Typography sx={{ color: '#fff', fontSize: 13 }}>{badge}</Typography>
        }
        color='primary'
        onClick={handleOpenNotification}
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
        MenuListProps={{
          'aria-labelledby': 'notification-button',
        }}
        disableScrollLock={true}
        ref={containerRef}
        onClose={handleCloseNotification}
        PaperProps={{
          sx: { width: 400, maxHeight: 400 },
        }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Typography variant='h6'>Thông báo</Typography>
            <Button
              onClick={handleMarkReadAll}
              disabled={statsData?.data?.unreadCount === 0}
              sx={{
                fontSize: 13,
                color: '#4066cc',
                textTransform: 'none',
                ':hover': {
                  textDecoration: 'underline',
                  bgcolor: 'transparent',
                },
              }}>
              Đánh dấu tất cả là đã đọc
            </Button>
          </Box>
        </Box>
        {items?.length === 0 ? (
          <MenuItem disabled>
            <Typography color='text.secondary'>Không có thông báo</Typography>
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
                        fontWeight: notification?.isRead ? 400 : 600,
                        color: notification?.isRead
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
                {notification?.isRead ? (
                  <RadioButtonUncheckedIcon
                    className='icon-outline'
                    sx={{ color: '#0064d1', fontSize: 12 }}
                  />
                ) : (
                  <ButtonWithTooltip
                    title='Đánh dấu đã đọc'
                    onClick={() => handleMarkRead(notification?.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 12,
                      width: 12,
                      height: 12,
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
                )}
              </Box>
            </MenuItem>
          ))
        )}
        <Box
          ref={sentinelRef}
          sx={{
            h: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {/* {isFetchingNextPage ? 'Đang tải thêm…' : hasNextPage ? '' : 'Hết'} */}
        </Box>

        {/* Fallback nút bấm */}
        {/* {!isFetchingNextPage && hasNextPage && (
          <Button
            sx={{ width: '100%', py: 2, textAlign: 'center' }}
            onClick={() => fetchNextPage()}>
            Xem thêm
          </Button>
        )} */}
      </Menu>
    </>
  );
};

export default Notification;
