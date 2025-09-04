import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
