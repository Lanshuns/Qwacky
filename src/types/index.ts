export interface UserData {
  user: {
    email: string;
    username: string;
    access_token: string;
    cohort: string;
  };
  stats: {
    addresses_generated: number;
  };
  invites: string[];
  addresses: string[];
}

export interface LoginResponse {
  status: string;
  needs_otp?: boolean;
  message: string;
}

export interface VerifyResponse {
  status: string;
  dashboard?: UserData;
  access_token?: string;
  message: string;
}

export interface GenerateResponse {
  status: string;
  address?: string;
  message?: string;
}

export interface ReverseAlias {
  recipientEmail: string;
  alias: string;
  timestamp: number;
  lastModified?: number;
  notes?: string;
  username: string;
} 