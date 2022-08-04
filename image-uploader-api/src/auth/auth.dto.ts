export interface AuthDTO {
  email: string;
  password: string;
}

export interface ForgotDTO {
  email: string;
}

export interface ResetDTO {
  resetHash: string;
  password: string;
}