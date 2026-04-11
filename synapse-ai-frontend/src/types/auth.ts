export interface Token {
  access_token: string;
  token_type: string;
  expires_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  token: Token;
}

export interface LoginRequest {
  username: string;
  password: string;
  grant_type: string;
}
