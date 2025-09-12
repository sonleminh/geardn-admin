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
  useGetStats,
  useMarkAllRead,
  useMarkNotificationSeen,
  useMarkNotificationsRead,
  useNotiInfinite,
} from '@/services/notification';
import { Notification } from '@/types/type.notification';
import { useNotificationNavigate } from '@/utils/getNotificationHref';

type NotificationItemProps = {
  notification: Notification;
  onNavigate: (n: Notification) => void;
  onMarkRead: (id: string) => void;
  handleCloseNotification: () => void;
};

const NotificationItem: React.FC<NotificationItemProps> = React.memo(
  ({ notification, onNavigate, onMarkRead, handleCloseNotification }) => {
    return (
      <MenuItem
        key={notification?.id}
        onClick={() => {
          onNavigate(notification);
          handleCloseNotification();
        }}
        sx={{
          display: 'block',
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          '&:last-child': {
            borderBottom: 'none',
          },
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
                {format(new Date(notification?.createdAt), 'dd/MM/yyyy HH:mm', {
                  locale: vi,
                })}
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
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification?.id);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 12,
                width: 12,
                height: 12,
                p: 0.5,
                borderRadius: '50%',
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
    );
  }
);
NotificationItem.displayName = 'NotificationItem';

const NotificationMenu: React.FC = () => {
  const { isOpen, setOpen } = useNotifyStore();

  const { data: statsData, isFetching: isFetchingStats } = useGetStats();
  const markNotificationSeenMutation = useMarkNotificationSeen();
  const markNotificationsReadMutation = useMarkNotificationsRead();
  const markAllAsReadMutation = useMarkAllRead();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useNotiInfinite();
  const notiItems = React.useMemo<Notification[]>(
    () => (data ? data.pages?.flatMap((p) => p.data?.items || []) ?? [] : []),
    [data]
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const [anchorElNotification, setAnchorElNotification] =
    React.useState<null | HTMLElement>(null);

  const openMenuNotification = Boolean(anchorElNotification);

  React.useEffect(() => {
    if (!openMenuNotification) return;

    let locked = false;
    let cancelled = false;

    const setup = () => {
      if (cancelled) return;
      const root = containerRef.current;
      const sentinel = sentinelRef.current;
      if (!root || !sentinel) {
        requestAnimationFrame(setup);
        return;
      }

      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          if (!hasNextPage || isFetchingNextPage || locked) return;

          locked = true;
          fetchNextPage().finally(() => {
            locked = false;
          });
        },
        { root, rootMargin: '0px 0px', threshold: 0 }
      );

      observerRef.current = io;
      io.observe(sentinel);
    };

    setup();

    return () => {
      cancelled = true;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [openMenuNotification, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleOpenNotification = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorElNotification(e.currentTarget);
      setOpen(true);
      markNotificationSeenMutation.mutate();
    },
    [markNotificationSeenMutation, setOpen]
  );

  const handleMarkRead = React.useCallback(
    (id: string) => {
      markNotificationsReadMutation.mutate([id]);
    },
    [markNotificationsReadMutation]
  );

  const handleMarkReadAll = React.useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const handleCloseNotification = React.useCallback(() => {
    setAnchorElNotification(null);
    setOpen(false);
  }, [setOpen]);

  const onNavigate = useNotificationNavigate();

  return (
    <>
      <Badge
        badgeContent={
          <Typography sx={{ color: '#fff', fontSize: 13 }}>
            {statsData?.data?.unseenCount ?? 0}
          </Typography>
        }
        color='primary'
        onClick={handleOpenNotification}
        invisible={isOpen || statsData?.data?.unseenCount === 0}
        sx={{
          mr: 2,
          '& .MuiBadge-badge': {
            top: 4,
            right: 1,
            display: isFetchingStats ? 'none' : 'flex',
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
        keepMounted
        MenuListProps={{
          'aria-labelledby': 'notification-button',
        }}
        disableScrollLock={true}
        onClose={handleCloseNotification}
        PaperProps={{
          sx: {
            width: 400,
            borderRadius: 2,
            overflow: 'hidden',
            '& .MuiList-root': {
              p: 0,
              borderRadius: 2,
              overflow: 'hidden',
            },
            '& .MuiMenu-list': {
              p: 0,
              borderRadius: 2,
              overflow: 'hidden',
            },
          },
        }}
        sx={{
          'MuiList-root': {
            p: 0,
          },
        }}>
        <Box sx={{ p: '8px 12px', borderBottom: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 0,
            }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              Thông báo
            </Typography>
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
        <Box
          ref={containerRef}
          sx={{
            maxHeight: 280,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#ccc',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#999',
            },
          }}>
          {status === 'pending' && (
            <MenuItem disabled>
              <Typography color='text.secondary'>Đang tải…</Typography>
            </MenuItem>
          )}
          {status === 'error' && (
            <MenuItem disabled>
              <Typography color='error'>Lỗi tải dữ liệu</Typography>
            </MenuItem>
          )}
          {status === 'success' && notiItems?.length === 0 && (
            <MenuItem disabled>
              <Typography color='text.secondary'>Không có thông báo</Typography>
            </MenuItem>
          )}
          {status === 'success' &&
            openMenuNotification &&
            notiItems?.map((notification) => (
              <NotificationItem
                key={notification?.id}
                notification={notification}
                onNavigate={onNavigate}
                onMarkRead={handleMarkRead}
                handleCloseNotification={handleCloseNotification}
              />
            ))}
          <Box
            ref={sentinelRef}
            sx={{
              width: '100%',
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Typography variant='caption' color='text.secondary'>
              {isFetchingNextPage ? 'Đang tải thêm…' : hasNextPage ? '' : 'Hết'}
            </Typography>
          </Box>
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

export default NotificationMenu;
