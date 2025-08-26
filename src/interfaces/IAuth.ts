export interface ILoginPayload {
    email: string;
    password: string;
}

export interface ILoginResponse {
  data: {
    id: number;
    email: string;
    name: string;
    lastReadNotificationsAt: Date;
  },
  success: boolean;
  message: string;
}


export interface IRefreshTokenResponse {
  accessToken: string;
  statusCode: number;
  message: string;
}