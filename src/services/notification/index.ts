import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { Notification } from '@/types/type.notification';
import { QueryKeys } from '@/constants/query-key';
import { TBaseResponse } from '@/types/response.type';

const notificationUrl = '/admin/notifications';

interface IGetNotificationListResponse {
  items: Notification[];
  nextCursor: string;
  cutoff: Date;
}

export const useOpenNotifications = () =>
  useMutation({
    mutationFn: async (payload: { limit?: number; cursor?: number }) => {
      const { data } = await axiosInstance.post('/notifications/open', payload);
      return data.data as { items: Notification[]; nextCursor: number | null; unread: number; lastReadAt: string };
    },
  });

// Add this new hook for unread count
export const useGetStats = () => {
  return useQuery({
    queryKey: [QueryKeys.Notification, 'stats'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${notificationUrl}/stats`);
      return response.data as TBaseResponse<{ count: number, unreadCount: Date | null }>;
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

export const useMarkAllNotificationsRead = () => {
  return useMutation({
    mutationFn: async (cutoff: Date) => {
      const response = await axiosInstance.patch(`${notificationUrl}/mark-all-read`, {
        before: cutoff,
      });
      return response.data;
    },
  });
};
