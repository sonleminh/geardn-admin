export type Notification = {
    id: string;
    type: string;
    title: string;
    data?: any;
    createdAt: string;
    isRead?: boolean;
  };