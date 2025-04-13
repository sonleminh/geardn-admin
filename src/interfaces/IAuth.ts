export interface ILoginPayload {
    email: string;
    password: string;
}

export interface ILoginResponse {
  data: {
    id: number;
    email: string;
    name: string;
  },
  success: boolean;
  message: string;
}


export interface IRefreshTokenResponse {
  accessToken: string;
  statusCode: number;
  message: string;
}