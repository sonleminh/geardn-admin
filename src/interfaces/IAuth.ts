export interface ILoginPayload {
    email: string;
    password: string;
}

export interface ILoginResponse {
  _id?: string;
  email: string;
  name: string;
}


export interface IRefreshTokenResponse {
  accessToken: string;
  statusCode: number;
  message: string;
}