export type ResourceType = 'ORDER' | 'RETURN_REQUEST' | 'PRODUCT' | 'USER';

export type Notification = {
    id: string;
    type: string;
    title: string;
    data?: Record<string, unknown>;
    resourceId?: string;
    resourceType?: ResourceType;
    createdAt: string;
    isRead?: boolean;
  };