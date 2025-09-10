export type Notification = {
    id: string;
    
    attributeId: string;

    type: string;
    title: string;
    data?: any;
    createdAt: string;
    isRead?: boolean;
  };