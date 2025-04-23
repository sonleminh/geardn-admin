export type TPaginatedResponse<T> = {
    data: T[];
    meta: {
      total: number;
      page: number;
      pageSize: number;
    };
    status: boolean;
    message: string;
  };

  export type TBaseResponse<T> = {
    success: boolean;
    message: string;
    data: T;
  };