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
      return response.data as TBaseResponse<{ unseenCount: number, unreadCount: number }>;
    },
    // Refresh every 30 seconds for real-time updates
    refetchInterval: 30000,
  });
};

export const useMarkNotificationSeen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`${notificationUrl}/seen`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.Notification, 'stats'] });
      const prevStats = queryClient.getQueryData<any>([QueryKeys.Notification, 'stats']);
      queryClient.setQueryData([QueryKeys.Notification, 'stats'], (old: any) => {
        return { ...old, data: { ...old.data, unseenCount: 0 } };
      });
      return { prevStats };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Notification, 'stats'] });
    },
  });
};

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();
  const listKey = [QueryKeys.Notification, 'infinite'];

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await axiosInstance.post(`${notificationUrl}/read`, {
        ids: ids,
      });
      return response.data;
    },
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const prevList = queryClient.getQueryData<any>(listKey);

      queryClient.setQueryData(listKey, (old: any) => {
        if (!old) return old;
        const pages = old.pages.map((p: any) => {
          const items = p.data.items.map((it: Noti) => {
            if (ids.includes(it.id) && !it.isRead) {
              return { ...it, isRead: true };
            }
            return it;
          });
          return { ...p, data: { ...p.data, items } };
        });

        return { ...old, pages };
      });
      return { prevList };
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

async function getNotifications(cursor?: Cursor) {
  const res = await axiosInstance.get(`${notificationUrl}`, { withCredentials: true, params: {
    cursorId: cursor?.cursorId,
    cursorCreatedAt: cursor?.cursorCreatedAt,
    limit: 5,
  } });
  return res.data as TBaseResponse<Page>;
}

export function useNotiInfinite() {
  return useInfiniteQuery({
    queryKey: [QueryKeys.Notification, 'infinite'],
    initialPageParam: {} as Cursor, 
    queryFn: ({ pageParam }) => getNotifications(pageParam),
    getNextPageParam: (last): Cursor | undefined =>
      last?.data?.nextCursorId && last?.data?.nextCursorCreatedAt
        ? { cursorId: last.data.nextCursorId, cursorCreatedAt: last.data.nextCursorCreatedAt }
        : undefined,
    refetchOnWindowFocus: false,
  });
}