import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { Notification } from '@/types/type.notification';
import { QueryKeys } from '@/constants/query-key';
import { TBaseResponse } from '@/types/response.type';

const notificationUrl = '/admin/notifications';

interface IGetNotificationListResponse {
  items: Notification[];
  nextCursorId: string;
  nextCursorCreatedAt: Date;
}

type Cursor = { cursorId?: string; cursorCreatedAt?: string };
type Noti = { id: string; title: string; createdAt: string; isRead: boolean };
type Page = { items: Noti[]; nextCursorId: string | null; nextCursorCreatedAt: string | null };


export const useGetNotifications = () =>
  useQuery({
      queryKey: [QueryKeys.Notification],
      queryFn: async () => {
      const response = await axiosInstance.get(`${notificationUrl}`);
      return response.data as TBaseResponse<IGetNotificationListResponse>;
    },
  });

// Add this new hook for unread count
export const useGetStats = () => {
  return useQuery({
    queryKey: [QueryKeys.Notification, 'stats'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${notificationUrl}/stats`);
      return response.data as TBaseResponse<{ count: number, unreadCount: number }>;
    },
    // Refresh every 30 seconds for real-time updates
    refetchInterval: 30000,
  });
};

export const useMarkNotificationSeen = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`${notificationUrl}/seen`);
      return response.data;
    },
  });
};

export const useMarkNotificationsRead = () => {
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await axiosInstance.post(`${notificationUrl}/read`, {
        ids: ids,
      });
      return response.data;
    },
  });
};

export const useMarkAllRead = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(`${notificationUrl}/read-all`);
      return response.data;
    },
  });
};

async function fetchNotis(cursor?: Cursor): Promise<Page> {
  const u = new URL('/api/notifications', window.location.origin);
  u.searchParams.set('limit', '20');
  if (cursor?.cursorId && cursor?.cursorCreatedAt) {
    u.searchParams.set('cursorId', cursor.cursorId);
    u.searchParams.set('cursorCreatedAt', cursor.cursorCreatedAt);
  }
  const res = await fetch(u.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export function useNotiInfinite() {
  return useInfiniteQuery({
    queryKey: [QueryKeys.Notification, 'infinite'],
    initialPageParam: {} as Cursor, 
    queryFn: ({ pageParam }) => fetchNotis(pageParam),
    getNextPageParam: (last): Cursor | undefined =>
      last.nextCursorId && last.nextCursorCreatedAt
        ? { cursorId: last.nextCursorId, cursorCreatedAt: last.nextCursorCreatedAt }
        : undefined,
    refetchOnWindowFocus: false,
  });
}