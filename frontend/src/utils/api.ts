import axios from 'axios';
import { authStore } from '../stores/authStore';
import type { AuthResponse, LoginCredentials, Post, CreatePostData } from '../types';

const API_BASE_URL = 'http://localhost:8000';
const CACHE_BASE_URL = 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const cacheClient = axios.create({
  baseURL: CACHE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/login', credentials);
    return response.data;
  },

  async register(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/register', credentials);
    return response.data;
  },
};

export const postsAPI = {
  async getPosts(): Promise<Post[]> {
    try {
      const response = await cacheClient.get('/cache/posts');
      return response.data;
    } catch {
      const response = await apiClient.get('/api/posts');
      return response.data;
    }
  },

  async createPost(postData: CreatePostData): Promise<Post> {
    const response = await apiClient.post('/api/posts', postData);
    return response.data;
  },

  async getPost(id: number): Promise<Post> {
    try {
      const response = await cacheClient.get(`/cache/posts/${id}`);
      return response.data;
    } catch {
      const response = await apiClient.get(`/api/posts/${id}`);
      return response.data;
    }
  },
};

export { apiClient, cacheClient };