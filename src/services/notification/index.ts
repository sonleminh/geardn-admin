import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { Notification } from '@/types/type.notification';
import { QueryKeys } from '@/constants/query-key';
import { TBaseResponse } from '@/types/response.type';

const notificationUrl = '/admin/notifications';

interface IGetNotificationListResponse {
  items: Notification[];
  nextCursor: string;
}

export const useGetNotificationList = () => {
  return useQuery({
    queryKey: [QueryKeys.Notification],
    queryFn: async () => {
      const response = await axiosInstance.get(notificationUrl);
      return response.data as TBaseResponse<IGetNotificationListResponse>;
    },
  });
};

// Add this new hook for unread count
export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: [QueryKeys.Notification, 'unread-count'],
    queryFn: async () => {
      const response = await axiosInstance.get(`${notificationUrl}/unread-count`);
      return response.data as TBaseResponse<{ count: number }>;
    },
    // Refresh every 30 seconds for real-time updates
    refetchInterval: 30000,
  });
};

export const useMarkNotificationRead = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.patch(`${notificationUrl}/${id}/read`);
      return response.data;
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`${notificationUrl}/read-all`);
      return response.data;
    },
  });
};
