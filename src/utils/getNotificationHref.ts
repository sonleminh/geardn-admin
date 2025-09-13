import React from "react";
import { useMarkNotificationsRead } from "@/services/notification";
import { Notification, ResourceType } from "@/types/type.notification";
import { useNavigate } from "react-router-dom";

const routeMap: Partial<Record<ResourceType, (n: Notification) => string>> = {
    ORDER: (n) =>
      `/order/${ n.resourceId ?? '' }`.replace(/\/$/, ''),
    RETURN_REQUEST: (n) =>
      `/order/return-request/${ n.resourceId ?? '' }`.replace(/\/$/, ''),
  };
  
function getNotificationHref(n: Notification): string {
    const byResource = n.resourceType && routeMap[n.resourceType]?.(n);
    if (byResource && byResource !== '/order/list' && byResource !== '/return-request/') {
      return byResource;
    }
    return '/';
  }

  export function useNotificationNavigate(): (notification: Notification) => void {
    const navigate = useNavigate();
    const { mutate: markRead } = useMarkNotificationsRead();
    return React.useCallback((notification: Notification) => {
      const href = getNotificationHref(notification);
      navigate(href);
      if (!notification.isRead) {
        markRead([notification.id]); 
      }
    }, [navigate, markRead]);
  }