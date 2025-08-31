export interface User {
  id: number;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}


export interface CreatePostData {
  title: string;
  content: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}